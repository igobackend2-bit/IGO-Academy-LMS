/**
 * Payment routes — Cashfree integration for paid course enrollment
 * @module routes/payment.routes
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Cashfree, CFEnvironment } = require('cashfree-pg');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { db } = require('../config/db');
const { createError } = require('../middleware/errorHandler');

function getCashfree() {
  if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
    throw createError('PAYMENT_UNAVAILABLE', 'Payment service not configured — set CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET');
  }
  const env = process.env.CASHFREE_ENV === 'production' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
  return new Cashfree(env, process.env.CASHFREE_CLIENT_ID, process.env.CASHFREE_CLIENT_SECRET);
}

function cashfreeMode() {
  return process.env.CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
}

// ── POST /api/payments/create-order ──────────────────────────────
// Creates a Cashfree order for a paid course (student must be logged in)
router.post('/create-order', verifyToken, requireRole('student'), async (req, res, next) => {
  try {
    const { course_id } = req.body;
    if (!course_id) throw createError('INVALID_INPUT', 'course_id required');

    const course = await db('courses').where({ id: course_id }).first();
    if (!course) throw createError('NOT_FOUND', 'Course not found');
    if (!course.price || Number(course.price) <= 0) {
      throw createError('INVALID_INPUT', 'This course is free — use /enrollments/self');
    }

    const alreadyEnrolled = await db('enrollments')
      .where({ student_id: req.user.id, course_id })
      .first();
    if (alreadyEnrolled) throw createError('CONFLICT', 'Already enrolled in this course');

    // Fetch student's full profile — Cashfree requires a phone number on the order
    const student = await db('users').where({ id: req.user.id }).select('full_name', 'email', 'phone').first();
    if (!student?.phone) {
      throw createError('INVALID_INPUT', 'Please add a phone number to your profile before paying — Cashfree requires it for the order.');
    }

    // Cashfree order_id is caller-generated and must be unique (unlike Razorpay,
    // which generated it server-side). Short prefixes + a timestamp, well under
    // Cashfree's length limits — not a secret, purely a lookup key.
    const orderId = `ord_${course_id.slice(0, 8)}_${req.user.id.slice(0, 8)}_${Date.now().toString(36)}`;
    const returnUrl = `${process.env.CLIENT_URL || 'https://igoacademy.in'}/student/dashboard`;

    const order = await getCashfree().PGCreateOrder({
      order_id: orderId,
      order_amount: Number(course.price),
      order_currency: 'INR',
      customer_details: {
        customer_id: req.user.id,
        customer_phone: student.phone,
        customer_name: student.full_name || undefined,
        customer_email: student.email || undefined,
      },
      order_meta: {
        return_url: returnUrl,
      },
      // Equivalent of Razorpay's `notes` — echoed back on fetch and in the
      // webhook payload, so course_id/student_id are never trusted from the
      // client, only from what Cashfree itself hands back.
      order_tags: {
        course_id: course_id.toString(),
        student_id: req.user.id.toString(),
      },
    });

    await db('payments').insert({
      student_id: req.user.id,
      course_id,
      gateway: 'cashfree',
      gateway_order_id: order.data.order_id,
      amount: course.price,
      currency: order.data.order_currency,
      status: 'created',
      receipt: order.data.order_id,
    });

    res.json({
      success: true,
      data: {
        orderId: order.data.order_id,
        paymentSessionId: order.data.payment_session_id,
        mode: cashfreeMode(),
        amount: order.data.order_amount,
        currency: order.data.order_currency,
        courseName: course.title,
        studentName: student?.full_name || req.user.email,
        studentEmail: student?.email || req.user.email,
      },
      error: null,
      message: 'Order created',
    });
  } catch (err) { next(err); }
});

// ── POST /api/payments/verify ─────────────────────────────────────
// Confirms order status directly from Cashfree (never trusts the client's
// claim) and enrolls the student.
router.post('/verify', verifyToken, requireRole('student'), async (req, res, next) => {
  try {
    const { order_id } = req.body;
    if (!order_id) throw createError('INVALID_INPUT', 'order_id required');

    // Fetch the order status from Cashfree's own server — the only source of
    // truth. Also pulls back order_tags (course_id/student_id), same pattern
    // as fetching order.notes from Razorpay's signed order.
    const fetched = await getCashfree().PGFetchOrder(order_id);
    const order = fetched.data;

    if (order.order_status !== 'PAID') {
      throw createError('UNAUTHORIZED', `Payment not completed — order status is ${order.order_status}`);
    }

    const course_id = order.order_tags?.course_id;
    if (!course_id) {
      throw createError('INVALID_INPUT', 'Order is missing course_id in tags');
    }
    // Order must belong to the authenticated student — order_tags is set by
    // us at creation time and echoed back verbatim, so this also guards
    // against one student verifying another's order_id.
    if (order.order_tags?.student_id !== req.user.id.toString()) {
      throw createError('UNAUTHORIZED', 'This order does not belong to you');
    }

    // Guard: check not already enrolled
    const existing = await db('enrollments')
      .where({ student_id: req.user.id, course_id })
      .first();
    if (existing) {
      return res.json({
        success: true,
        data: existing,
        error: null,
        message: 'Already enrolled in this course',
      });
    }

    // Enroll student with 1-year access
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    const endDateStr = endDate.toISOString().split('T')[0];

    const [enrollment] = await db('enrollments').insert({
      student_id: req.user.id,
      course_id,
      start_date: today,
      end_date: endDateStr,
      payment_status: 'paid',
      is_expired: false,
    }).returning('*');

    // Mark the durable payment record paid. Idempotent no-op if the webhook
    // already beat this request to it (race is expected, not an error).
    await db('payments')
      .where({ gateway_order_id: order_id })
      .update({ status: 'paid', updated_at: db.fn.now() });

    res.json({
      success: true,
      data: enrollment,
      error: null,
      message: 'Payment verified. You are enrolled!',
    });
  } catch (err) { next(err); }
});

// ── POST /api/payments/webhook ────────────────────────────────────
// Cashfree server-to-server callback — the durable half of the flow. Fires
// even if the student's browser dies before /verify completes, so a paid
// order never goes unenrolled. No verifyToken: authenticated instead by
// HMAC-SHA256(timestamp + rawBody) keyed on CASHFREE_CLIENT_SECRET — Cashfree
// reuses the API secret for webhook signing, no separate webhook secret.
router.post('/webhook', async (req, res, next) => {
  try {
    const secret = process.env.CASHFREE_CLIENT_SECRET;
    if (!secret) {
      // Not configured yet — ack with 200 so Cashfree doesn't retry-storm us,
      // but do nothing. create-order already blocks checkout until keys exist.
      return res.status(200).json({ success: false, message: 'Webhook not configured' });
    }

    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    if (!signature || !timestamp) throw createError('UNAUTHORIZED', 'Missing webhook signature/timestamp');
    if (!req.rawBody) throw createError('INTERNAL_ERROR', 'Raw body unavailable for signature check');

    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(timestamp + req.rawBody.toString('utf8'))
      .digest('base64');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw createError('UNAUTHORIZED', 'Webhook signature mismatch');
    }

    const payload = req.body;

    if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const orderId = payload.data?.order?.order_id;
      const paymentId = payload.data?.payment?.cf_payment_id;
      const tags = payload.data?.order?.order_tags || {};
      const student_id = tags.student_id;
      const course_id = tags.course_id;

      if (orderId) {
        await db('payments')
          .where({ gateway_order_id: orderId })
          .update({ gateway_payment_id: paymentId, status: 'paid', updated_at: db.fn.now() });
      }

      // Create the enrollment if /verify never landed (browser closed etc.)
      if (student_id && course_id) {
        const existing = await db('enrollments')
          .where({ student_id, course_id })
          .first();
        if (!existing) {
          const today = new Date().toISOString().split('T')[0];
          const endDate = new Date();
          endDate.setFullYear(endDate.getFullYear() + 1);
          const endDateStr = endDate.toISOString().split('T')[0];
          await db('enrollments').insert({
            student_id,
            course_id,
            start_date: today,
            end_date: endDateStr,
            payment_status: 'paid',
            is_expired: false,
          });
        }
      }
    } else if (payload.type === 'PAYMENT_FAILED_WEBHOOK' || payload.type === 'PAYMENT_USER_DROPPED_WEBHOOK') {
      const orderId = payload.data?.order?.order_id;
      if (orderId) {
        await db('payments')
          .where({ gateway_order_id: orderId })
          .update({ status: 'failed', updated_at: db.fn.now() });
      }
    }

    res.status(200).json({ success: true, message: 'ok' });
  } catch (err) { next(err); }
});

// ── GET /api/payments ──────────────────────────────────────────────
// Admin-only list of payment records — cross-reference before a manual
// refund in Cashfree's own dashboard (refunds are not self-service here).
router.get('/', verifyToken, requireRole('admin'), async (req, res, next) => {
  try {
    const rows = await db('payments')
      .join('users', 'payments.student_id', 'users.id')
      .join('courses', 'payments.course_id', 'courses.id')
      .select(
        'payments.id',
        'payments.gateway',
        'payments.gateway_order_id',
        'payments.gateway_payment_id',
        'payments.amount',
        'payments.currency',
        'payments.status',
        'payments.receipt',
        'payments.created_at',
        'users.full_name as student_name',
        'users.email as student_email',
        'courses.title as course_title'
      )
      .orderBy('payments.created_at', 'desc');

    res.json({ success: true, data: rows, error: null, message: 'Payments fetched' });
  } catch (err) { next(err); }
});

module.exports = router;
