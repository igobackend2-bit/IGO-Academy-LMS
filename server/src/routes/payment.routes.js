/**
 * Payment routes — Razorpay integration for paid course enrollment
 * @module routes/payment.routes
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { db } = require('../config/db');
const { createError } = require('../middleware/errorHandler');

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw createError('PAYMENT_UNAVAILABLE', 'Payment service not configured — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
  }
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

// ── POST /api/payments/create-order ──────────────────────────────
// Creates a Razorpay order for a paid course (student must be logged in)
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

    const student = await db('users').where({ id: req.user.id }).select('full_name', 'email', 'phone').first();

    // Razorpay's `receipt` is our own lookup key (max 40 chars) — course_id
    // and student_id both go in `notes` instead, which Razorpay echoes back
    // verbatim in the webhook payload and on the order object.
    const receipt = `rcpt_${course_id.slice(0, 8)}_${Date.now().toString(36)}`;
    const amountPaise = Math.round(Number(course.price) * 100);

    const order = await getRazorpay().orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: {
        course_id: course_id.toString(),
        student_id: req.user.id.toString(),
      },
    });

    await db('payments').insert({
      student_id: req.user.id,
      course_id,
      gateway: 'razorpay',
      gateway_order_id: order.id,
      amount: course.price,
      currency: order.currency,
      status: 'created',
      receipt,
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        courseName: course.title,
        studentName: student?.full_name || req.user.email,
        studentEmail: student?.email || req.user.email,
        studentPhone: student?.phone || undefined,
      },
      error: null,
      message: 'Order created',
    });
  } catch (err) { next(err); }
});

// ── POST /api/payments/verify ─────────────────────────────────────
// Confirms the checkout's signature (proves the payment came from Razorpay,
// not a client claiming success) and enrolls the student.
router.post('/verify', verifyToken, requireRole('student'), async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw createError('INVALID_INPUT', 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required');
    }

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const sigBuf = Buffer.from(razorpay_signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw createError('UNAUTHORIZED', 'Payment signature verification failed');
    }

    const payment = await db('payments').where({ gateway_order_id: razorpay_order_id }).first();
    if (!payment) throw createError('NOT_FOUND', 'Order not found');
    // Order must belong to the authenticated student — guards against one
    // student verifying (and reaping the enrollment from) another's order.
    if (payment.student_id !== req.user.id) {
      throw createError('UNAUTHORIZED', 'This order does not belong to you');
    }

    const course_id = payment.course_id;

    // Guard: check not already enrolled
    const existing = await db('enrollments')
      .where({ student_id: req.user.id, course_id })
      .first();
    if (existing) {
      await db('payments')
        .where({ gateway_order_id: razorpay_order_id })
        .update({ gateway_payment_id: razorpay_payment_id, status: 'paid', updated_at: db.fn.now() });
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
      paid_amount: payment.amount,
      is_expired: false,
    }).returning('*');

    // Mark the durable payment record paid. Idempotent no-op if the webhook
    // already beat this request to it (race is expected, not an error).
    await db('payments')
      .where({ gateway_order_id: razorpay_order_id })
      .update({ gateway_payment_id: razorpay_payment_id, status: 'paid', updated_at: db.fn.now() });

    res.json({
      success: true,
      data: enrollment,
      error: null,
      message: 'Payment verified. You are enrolled!',
    });
  } catch (err) { next(err); }
});

// ── POST /api/payments/webhook ────────────────────────────────────
// Razorpay server-to-server callback — the durable half of the flow. Fires
// even if the student's browser dies before /verify completes, so a paid
// order never goes unenrolled. No verifyToken: authenticated instead by
// HMAC-SHA256(rawBody) keyed on RAZORPAY_WEBHOOK_SECRET (a separate secret
// from the API key, set in the Razorpay dashboard's webhook config).
router.post('/webhook', async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      // Not configured yet — ack with 200 so Razorpay doesn't retry-storm us,
      // but do nothing. create-order already blocks checkout until keys exist,
      // and /verify covers the happy path in the meantime.
      return res.status(200).json({ success: false, message: 'Webhook not configured' });
    }

    const signature = req.headers['x-razorpay-signature'];
    if (!signature) throw createError('UNAUTHORIZED', 'Missing webhook signature');
    if (!req.rawBody) throw createError('INTERNAL_ERROR', 'Raw body unavailable for signature check');

    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(req.rawBody)
      .digest('hex');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw createError('UNAUTHORIZED', 'Webhook signature mismatch');
    }

    const payload = req.body;

    if (payload.event === 'payment.captured') {
      const entity = payload.payload?.payment?.entity;
      const orderId = entity?.order_id;
      const paymentId = entity?.id;
      const notes = entity?.notes || {};
      const student_id = notes.student_id;
      const course_id = notes.course_id;

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
            paid_amount: entity?.amount ? entity.amount / 100 : 0,
            is_expired: false,
          });
        }
      }
    } else if (payload.event === 'payment.failed') {
      const orderId = payload.payload?.payment?.entity?.order_id;
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
// refund in Razorpay's own dashboard (refunds are not self-service here).
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
