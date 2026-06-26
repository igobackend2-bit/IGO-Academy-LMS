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

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

    // Fetch student's full_name for Razorpay prefill (JWT only carries id/role/email)
    const student = await db('users').where({ id: req.user.id }).select('full_name', 'email').first();

    const order = await razorpay.orders.create({
      amount: Math.round(Number(course.price) * 100), // convert to paise
      currency: 'INR',
      receipt: `course_${course_id}_student_${req.user.id}`,
      notes: {
        course_id: course_id.toString(),
        student_id: req.user.id.toString(),
      },
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
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
// Verifies Razorpay payment signature and enrolls the student
router.post('/verify', verifyToken, requireRole('student'), async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw createError('INVALID_INPUT', 'Missing payment verification fields');
    }

    // Verify HMAC SHA256 signature (timing-safe comparison prevents timing attacks)
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(expectedSig, 'hex'), Buffer.from(razorpay_signature, 'hex'))) {
      throw createError('UNAUTHORIZED', 'Payment verification failed — signature mismatch');
    }

    // Fetch course_id from the signed Razorpay order (never trust req.body for this)
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const course_id = order.notes.course_id;
    if (!course_id) {
      throw createError('INVALID_INPUT', 'Order is missing course_id in notes');
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

    res.json({
      success: true,
      data: enrollment,
      error: null,
      message: 'Payment verified. You are enrolled!',
    });
  } catch (err) { next(err); }
});

module.exports = router;
