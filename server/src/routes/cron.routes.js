/**
 * Cron-triggered routes — invoked by Vercel Cron (HTTP GET on a schedule),
 * as an alternative to node-cron for serverless deployments where no process
 * stays alive to fire in-memory schedules.
 * @module routes/cron
 */
const express = require('express');
const router = express.Router();
const { runEnrollmentExpiryCheck } = require('../jobs/enrollmentExpiry.job');
const logger = require('../utils/logger');

/** Vercel signs cron requests with this header; also accept CRON_SECRET as a bearer token for manual triggers */
function requireCronSecret(req, res, next) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(500).json({ success: false, data: null, error: 'CONFIG_ERROR', message: 'CRON_SECRET not configured' });
  if (req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ success: false, data: null, error: 'UNAUTHORIZED', message: 'Invalid cron secret' });
  }
  next();
}

/** GET /api/cron/enrollment-expiry */
router.get('/enrollment-expiry', requireCronSecret, async (req, res) => {
  try {
    const count = await runEnrollmentExpiryCheck();
    logger.info(`[Cron] Expiry check complete — ${count} enrollment(s) marked expired`);
    res.json({ success: true, data: { expired: count }, error: null, message: 'OK' });
  } catch (err) {
    logger.error('[Cron] Expiry check failed:', err.message);
    res.status(500).json({ success: false, data: null, error: 'INTERNAL_ERROR', message: err.message });
  }
});

module.exports = router;
