/**
 * Enrollment controller — admin manages student course access
 * @module controllers/enrollment
 */
const EnrollmentModel = require('../models/enrollment.model');
const { sendWelcomeEmail } = require('../services/email.service');
const { createError } = require('../middleware/errorHandler');
const UserModel = require('../models/user.model');
const { db } = require('../config/db');
const logger = require('../utils/logger');

/** GET /api/enrollments — admin: all, student: own */
async function list(req, res, next) {
  try {
    if (req.user.role === 'student') {
      const data = await EnrollmentModel.findByStudent(req.user.id);
      return res.json({ success: true, data, error: null, message: 'OK' });
    }
    const result = await EnrollmentModel.listAll({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      search: req.query.search,
    });
    res.json({ success: true, data: result, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** GET /api/enrollments/my — student: own enrollments with course info + progress */
async function myEnrollments(req, res, next) {
  try {
    const rows = await EnrollmentModel.findByStudent(req.user.id);

    const data = await Promise.all(rows.map(async (e) => {
      const [{ c: totalModules }] = await db('class_modules')
        .where({ course_id: e.course_id, is_published: true }).count('* as c');
      const [{ c: completedModules }] = await db('attendance')
        .where({ student_id: req.user.id, class_type: 'recorded', completed: true })
        .whereIn('class_id', db('class_modules').where({ course_id: e.course_id }).select('id'))
        .count('* as c');
      const cert = await db('certificates')
        .where({ student_id: req.user.id, course_id: e.course_id, is_valid: true }).first();

      const progress = parseInt(totalModules) > 0
        ? Math.round((parseInt(completedModules) / parseInt(totalModules)) * 100)
        : 0;

      return {
        ...e,
        course: { title: e.course_title, thumbnail_url: e.thumbnail_url, duration_hours: e.duration_hours },
        trainer: { full_name: e.trainer_name },
        progress,
        completed: progress >= 100,
        certificate_issued: !!cert,
      };
    }));

    res.json({ success: true, data, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** POST /api/enrollments — admin creates enrollment */
async function create(req, res, next) {
  try {
    const { student_id, course_id, start_date, end_date, paid_amount } = req.body;

    // Check student exists
    const student = await UserModel.findById(student_id);
    if (!student) throw createError('NOT_FOUND', 'Student not found');

    const enrollment = await EnrollmentModel.create({
      student_id, course_id, start_date, end_date,
      paid_amount: paid_amount || 0,
    });

    // Fetch course for welcome email
    try {
      const course = await db('courses').where({ id: course_id }).first();
      await sendWelcomeEmail({
        to: student.email,
        name: student.full_name,
        courseName: course?.title || 'your course',
        endDate: end_date,
      });
    } catch (emailErr) {
      logger.error('[Enrollment] Welcome email failed:', emailErr.message);
    }

    logger.info(`[Enrollment] Student ${student_id} enrolled in ${course_id}`);
    res.status(201).json({ success: true, data: enrollment, error: null, message: 'Student enrolled' });
  } catch (err) { next(err); }
}

/** PUT /api/enrollments/:id */
async function update(req, res, next) {
  try {
    const { start_date, end_date, paid_amount, is_expired } = req.body;
    const enrollment = await EnrollmentModel.update(req.params.id, { start_date, end_date, paid_amount, is_expired });
    res.json({ success: true, data: enrollment, error: null, message: 'Enrollment updated' });
  } catch (err) { next(err); }
}

/** DELETE /api/enrollments/:id */
async function remove(req, res, next) {
  try {
    await EnrollmentModel.remove(req.params.id);
    res.json({ success: true, data: null, error: null, message: 'Enrollment removed' });
  } catch (err) { next(err); }
}

/** POST /api/enrollments/self — student self-enrolls in a free course */
async function selfEnroll(req, res, next) {
  try {
    const { course_id } = req.body;
    const student_id = req.user.id;

    if (!course_id) {
      return res.status(400).json({ success: false, data: null, error: 'INVALID_INPUT', message: 'course_id is required' });
    }

    // 1. Fetch course — 404 if not found
    const course = await db('courses').where({ id: course_id }).first();
    if (!course) {
      return res.status(404).json({ success: false, data: null, error: 'NOT_FOUND', message: 'Course not found' });
    }

    // 2. Check course is free (price = 0 or null)
    const price = parseFloat(course.price) || 0;
    if (price > 0) {
      return res.status(403).json({ success: false, data: null, error: 'PAYMENT_REQUIRED', message: 'Course requires payment' });
    }

    // 3. Check student not already enrolled
    const existing = await db('enrollments').where({ student_id, course_id }).first();
    if (existing) {
      return res.status(409).json({ success: false, data: null, error: 'ALREADY_ENROLLED', message: 'Already enrolled in this course' });
    }

    // 4. Compute dates
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 365);
    const fmt = (d) => d.toISOString().split('T')[0]; // YYYY-MM-DD

    // 5. INSERT enrollment
    const [enrollment] = await db('enrollments').insert({
      student_id,
      course_id,
      start_date: fmt(today),
      end_date: fmt(endDate),
      payment_status: 'free',
      is_expired: false,
    }).returning('*');

    logger.info(`[Enrollment] Student ${student_id} self-enrolled in course ${course_id} (free)`);
    res.status(201).json({ success: true, data: enrollment, error: null, message: 'Enrolled successfully' });
  } catch (err) { next(err); }
}

module.exports = { list, myEnrollments, create, update, remove, selfEnroll };
