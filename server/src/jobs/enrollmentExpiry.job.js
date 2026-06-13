/**
 * Enrollment Expiry Cron Job
 * Runs daily at midnight IST.
 * Marks all enrollments past end_date as expired and kills active sessions.
 * @module jobs/enrollmentExpiry
 */
const { db } = require('../config/db');
const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Find all enrollments where end_date < today and is_expired = false,
 * mark them expired, and invalidate active Redis sessions for those students.
 * @returns {Promise<number>} Count of enrollments marked as expired
 */
async function runEnrollmentExpiryCheck() {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Get all enrollments that have expired but aren't marked yet
  const expiredEnrollments = await db('enrollments')
    .where('end_date', '<', today)
    .where('is_expired', false)
    .select('id', 'student_id', 'course_id');

  if (expiredEnrollments.length === 0) return 0;

  const studentIds = [...new Set(expiredEnrollments.map((e) => e.student_id))];

  // Mark enrollments as expired
  await db('enrollments')
    .whereIn('id', expiredEnrollments.map((e) => e.id))
    .update({ is_expired: true, updated_at: db.fn.now() });

  // Kill active sessions for expired students (Redis)
  for (const studentId of studentIds) {
    const sessionKey = `session:${studentId}`;
    await redisClient.del(sessionKey);
    logger.info(`[ExpiryJob] Killed session for student ${studentId}`);
  }

  // Deactivate user sessions in DB too
  await db('user_sessions')
    .whereIn('user_id', studentIds)
    .where('expires_at', '>', db.fn.now())
    .delete();

  return expiredEnrollments.length;
}

module.exports = { runEnrollmentExpiryCheck };
