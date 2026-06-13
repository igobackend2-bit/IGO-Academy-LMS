/**
 * Cron job registry — starts all scheduled background tasks
 * @module jobs/index
 */
const cron = require('node-cron');
const { runEnrollmentExpiryCheck } = require('./enrollmentExpiry.job');
const logger = require('../utils/logger');

/**
 * Start all cron jobs for the IGo Academy Platform
 * @returns {void}
 */
function startCronJobs() {
  // ── Daily midnight IST — Mark expired enrollments ─────────
  // UTC 18:30 = IST 00:00
  const schedule = process.env.EXPIRY_CRON_SCHEDULE || '30 18 * * *';

  cron.schedule(schedule, async () => {
    logger.info('[Cron] Running enrollment expiry check…');
    try {
      const count = await runEnrollmentExpiryCheck();
      logger.info(`[Cron] Expiry check complete — ${count} enrollment(s) marked expired`);
    } catch (err) {
      logger.error('[Cron] Expiry check failed:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  logger.info(`[Cron] Jobs started — expiry check scheduled: ${schedule} IST`);
}

module.exports = { startCronJobs };
