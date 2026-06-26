/**
 * Enrollment Request controller — students request access, admin approves/rejects
 */
const { db } = require('../config/db');
const { createError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/** POST /api/enrollment-requests — student submits a request */
async function create(req, res, next) {
  try {
    const student_id = req.user.id;
    const { course_id, student_message } = req.body;
    if (!course_id) throw createError('INVALID_INPUT', 'course_id is required');

    const course = await db('courses').where({ id: course_id }).first();
    if (!course) throw createError('NOT_FOUND', 'Course not found');

    const alreadyEnrolled = await db('enrollments').where({ student_id, course_id }).first();
    if (alreadyEnrolled) {
      return res.status(409).json({ success: false, data: null, error: 'ALREADY_ENROLLED', message: 'You are already enrolled in this course' });
    }

    const existing = await db('enrollment_requests').where({ student_id, course_id }).first();
    if (existing) {
      if (existing.status === 'pending') {
        return res.status(409).json({ success: false, data: null, error: 'ALREADY_REQUESTED', message: 'Request already submitted — awaiting admin approval' });
      }
      if (existing.status === 'approved') {
        return res.status(409).json({ success: false, data: null, error: 'ALREADY_ENROLLED', message: 'This request was already approved' });
      }
      // Rejected — allow re-submission
      const [updated] = await db('enrollment_requests')
        .where({ id: existing.id })
        .update({ status: 'pending', student_message: student_message || null, admin_note: null, reviewed_by: null, reviewed_at: null, requested_at: db.fn.now(), updated_at: db.fn.now() })
        .returning('*');
      return res.status(200).json({ success: true, data: updated, error: null, message: 'Request re-submitted' });
    }

    const [row] = await db('enrollment_requests')
      .insert({ student_id, course_id, student_message: student_message || null })
      .returning('*');

    logger.info(`[EnrollReq] Student ${student_id} requested course ${course_id}`);
    res.status(201).json({ success: true, data: row, error: null, message: 'Enrollment request submitted' });
  } catch (err) { next(err); }
}

/** GET /api/enrollment-requests/my — student sees their own requests */
async function myRequests(req, res, next) {
  try {
    const rows = await db('enrollment_requests as r')
      .join('courses as c', 'r.course_id', 'c.id')
      .select('r.*', 'c.title as course_title', 'c.thumbnail_url', 'c.category', 'c.duration_hours')
      .where('r.student_id', req.user.id)
      .orderBy('r.requested_at', 'desc');
    res.json({ success: true, data: rows, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** GET /api/enrollment-requests — admin sees all requests */
async function list(req, res, next) {
  try {
    const { status } = req.query;
    const query = db('enrollment_requests as r')
      .join('users as u', 'r.student_id', 'u.id')
      .join('courses as c', 'r.course_id', 'c.id')
      .leftJoin('users as admin', 'r.reviewed_by', 'admin.id')
      .select(
        'r.*',
        'u.full_name as student_name', 'u.email as student_email', 'u.phone as student_phone',
        'c.title as course_title', 'c.category', 'c.duration_hours',
        'admin.full_name as reviewed_by_name'
      )
      .orderBy('r.requested_at', 'desc');
    if (status) query.where('r.status', status);
    const rows = await query;
    res.json({ success: true, data: rows, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** PUT /api/enrollment-requests/:id/approve — admin approves (auto-creates enrollment) */
async function approve(req, res, next) {
  try {
    const { admin_note, start_date, end_date, paid_amount } = req.body;
    const reqRow = await db('enrollment_requests').where({ id: req.params.id }).first();
    if (!reqRow) throw createError('NOT_FOUND', 'Request not found');
    if (reqRow.status !== 'pending') {
      return res.status(400).json({ success: false, data: null, error: 'INVALID_STATE', message: `Request is already ${reqRow.status}` });
    }

    const today = new Date();
    const defaultEnd = new Date(today); defaultEnd.setFullYear(defaultEnd.getFullYear() + 1);
    const fmt = (d) => d.toISOString().split('T')[0];

    await db.transaction(async (trx) => {
      await trx('enrollment_requests').where({ id: req.params.id }).update({
        status: 'approved',
        admin_note: admin_note || null,
        reviewed_by: req.user.id,
        reviewed_at: db.fn.now(),
        updated_at: db.fn.now(),
      });

      const alreadyEnrolled = await trx('enrollments').where({ student_id: reqRow.student_id, course_id: reqRow.course_id }).first();
      if (!alreadyEnrolled) {
        await trx('enrollments').insert({
          student_id: reqRow.student_id,
          course_id: reqRow.course_id,
          start_date: start_date || fmt(today),
          end_date: end_date || fmt(defaultEnd),
          payment_status: 'pending',
          paid_amount: paid_amount || 0,
          is_expired: false,
        });
      }
    });

    logger.info(`[EnrollReq] Admin ${req.user.id} approved request ${req.params.id}`);
    res.json({ success: true, data: null, error: null, message: 'Request approved — student enrolled' });
  } catch (err) { next(err); }
}

/** PUT /api/enrollment-requests/:id/reject — admin rejects */
async function reject(req, res, next) {
  try {
    const { admin_note } = req.body;
    const reqRow = await db('enrollment_requests').where({ id: req.params.id }).first();
    if (!reqRow) throw createError('NOT_FOUND', 'Request not found');
    if (reqRow.status !== 'pending') {
      return res.status(400).json({ success: false, data: null, error: 'INVALID_STATE', message: `Request is already ${reqRow.status}` });
    }

    await db('enrollment_requests').where({ id: req.params.id }).update({
      status: 'rejected',
      admin_note: admin_note || null,
      reviewed_by: req.user.id,
      reviewed_at: db.fn.now(),
      updated_at: db.fn.now(),
    });

    logger.info(`[EnrollReq] Admin ${req.user.id} rejected request ${req.params.id}`);
    res.json({ success: true, data: null, error: null, message: 'Request rejected' });
  } catch (err) { next(err); }
}

module.exports = { create, myRequests, list, approve, reject };
