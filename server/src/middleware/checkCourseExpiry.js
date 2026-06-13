/**
 * checkCourseExpiry middleware — ensures the student's enrollment is still active
 * Reads courseId from req.params or req.query or req.body
 * Must be used after verifyToken
 * @module middleware/checkCourseExpiry
 */
const { db } = require('../config/db');
const { createError } = require('./errorHandler');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function checkCourseExpiry(req, res, next) {
  try {
    // Only applies to students
    if (req.user.role !== 'student') return next();

    const courseId = req.params.courseId || req.query.courseId || req.body.courseId;
    if (!courseId) return next();

    const enrollment = await db('enrollments')
      .where({ student_id: req.user.id, course_id: courseId })
      .first();

    if (!enrollment) {
      return next(createError('NOT_ENROLLED', 'You are not enrolled in this course'));
    }

    if (enrollment.is_expired) {
      return next(createError('COURSE_EXPIRED', 'Your access to this course has ended. Contact IGo Academy.'));
    }

    // Check end_date in real time (cron may not have run yet)
    const today = new Date().toISOString().split('T')[0];
    if (enrollment.end_date < today) {
      // Mark expired immediately
      await db('enrollments').where({ id: enrollment.id }).update({ is_expired: true });
      return next(createError('COURSE_EXPIRED', 'Your course access period has ended. Contact IGo Academy.'));
    }

    // Attach enrollment to request for downstream use
    req.enrollment = enrollment;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = checkCourseExpiry;
