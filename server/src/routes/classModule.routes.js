const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { db } = require('../config/db');
const StorageService = require('../services/storage.service');
const { createError } = require('../middleware/errorHandler');
router.use(verifyToken);
router.get('/:id/stream', async (req, res, next) => {
  try {
    const mod = await db('class_modules').where({ id: req.params.id, is_published: true }).first();
    if (!mod) throw createError('NOT_FOUND','Module not found');
    if (!mod.video_s3_key) throw createError('NOT_FOUND','No video');
    // Local disk, external URL, or S3 signed URL
    let url;
    if (mod.video_s3_key.startsWith('local:')) {
      url = `/api/courses/modules/${mod.id}/video`;
    } else if (mod.video_s3_key.startsWith('http')) {
      url = mod.video_s3_key;
    } else {
      url = await StorageService.getSignedUrl(mod.video_s3_key);
    }
    const att = await db('attendance').where({ student_id: req.user.id, class_id: req.params.id, class_type: 'recorded' }).first();
    res.json({ success: true, data: { url, lastPosition: att?.last_position_secs || 0, watchPct: att?.watch_pct || 0, completed: att?.completed || false }, error: null, message: 'OK' });
  } catch (err) { next(err); }
});
module.exports = router;
