/**
 * Admin controller — dashboard stats, reports
 * @module controllers/admin
 */
const { db } = require('../config/db');

/** GET /api/admin/dashboard-stats */
async function dashboardStats(req, res, next) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.substring(0, 7); // YYYY-MM

    const [
      { count: totalStudents },
      { count: activeStudents },
      { count: totalCourses },
      { count: totalTrainers },
      { count: certsThisMonth },
      { count: pendingReviews },
      expiringSoon,
    ] = await Promise.all([
      db('users').where({ role: 'student' }).count('* as count').first(),
      db('users').where({ role: 'student', is_active: true }).count('* as count').first(),
      db('courses').where({ is_active: true }).count('* as count').first(),
      db('users').where({ role: 'trainer', is_active: true }).count('* as count').first(),
      db('certificates').whereRaw(`TO_CHAR(issued_at, 'YYYY-MM') = ?`, [thisMonth]).count('* as count').first(),
      db('submissions').where({ status: 'submitted' }).count('* as count').first(),
      db('enrollments')
        .where({ is_expired: false })
        .whereBetween('end_date', [today, db.raw(`CURRENT_DATE + INTERVAL '7 days'`)])
        .count('* as count').first(),
    ]);

    res.json({
      success: true,
      data: {
        totalStudents: parseInt(totalStudents),
        activeStudents: parseInt(activeStudents),
        activeCourses: parseInt(totalCourses),
        totalTrainers: parseInt(totalTrainers),
        certsThisMonth: parseInt(certsThisMonth),
        pendingReviews: parseInt(pendingReviews),
        expiringCount: parseInt(expiringSoon.count),
      },
      error: null,
      message: 'OK',
    });
  } catch (err) { next(err); }
}

/** GET /api/admin/reports/attendance */
async function attendanceReport(req, res, next) {
  try {
    const { course_id, student_id, from_date, to_date } = req.query;
    const query = db('attendance as a')
      .join('users as u', 'a.student_id', 'u.id')
      .select('u.full_name', 'u.email', 'a.*');

    if (course_id) {
      query.whereIn('a.class_id',
        db('class_modules').where({ course_id }).select('id')
          .union(db('live_classes').where({ course_id }).select('id'))
      );
    }
    if (student_id) query.where('a.student_id', student_id);
    if (from_date)  query.where('a.marked_at', '>=', from_date);
    if (to_date)    query.where('a.marked_at', '<=', to_date);

    const data = await query.orderBy('a.marked_at', 'desc').limit(500);
    res.json({ success: true, data, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

/** GET /api/admin/reports/progress */
async function progressReport(req, res, next) {
  try {
    const { course_id } = req.query;
    const data = await db('enrollments as e')
      .join('users as u', 'e.student_id', 'u.id')
      .join('courses as c', 'e.course_id', 'c.id')
      .leftJoin(
        db('attendance').where({ class_type: 'recorded', completed: true })
          .select('student_id').count('* as completed_modules').groupBy('student_id').as('prog'),
        'prog.student_id', 'e.student_id'
      )
      .select('u.full_name', 'u.email', 'c.title as course_title', 'e.start_date', 'e.end_date',
              'e.is_expired', db.raw('COALESCE(prog.completed_modules, 0) as completed_modules'))
      .modify((q) => { if (course_id) q.where('e.course_id', course_id); })
      .limit(500);

    res.json({ success: true, data, error: null, message: 'OK' });
  } catch (err) { next(err); }
}

module.exports = { dashboardStats, attendanceReport, progressReport };
