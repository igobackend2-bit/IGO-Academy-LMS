const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { db } = require('../config/db');
router.use(verifyToken);
// Save recorded video progress (every 10s from player)
router.post('/progress', requireRole('student'), async (req, res, next) => {
  try {
    const { module_id, watched_seconds, last_position_secs, video_duration_secs } = req.body;
    const mod = await db('class_modules').where({ id: module_id }).first();
    if (!mod) return res.json({ success: false, error: 'NOT_FOUND', data: null, message: 'Module not found' });
    const watch_pct = Math.round((watched_seconds / (video_duration_secs || mod.duration_secs || 1)) * 100);
    const completed = watch_pct >= (mod.completion_pct || 80);
    const existing = await db('attendance').where({ student_id: req.user.id, class_id: module_id, class_type: 'recorded' }).first();
    if (existing) {
      await db('attendance').where({ id: existing.id }).update({
        watched_seconds: Math.max(existing.watched_seconds || 0, watched_seconds),
        watch_pct: Math.max(existing.watch_pct || 0, watch_pct),
        last_position_secs,
        completed: existing.completed || completed,
        status: completed ? 'present' : 'partial',
        updated_at: db.fn.now(),
      });
    } else {
      await db('attendance').insert({
        student_id: req.user.id, class_id: module_id, class_type: 'recorded',
        watched_seconds, watch_pct, last_position_secs, completed,
        status: completed ? 'present' : 'partial',
      });
    }
    res.json({ success: true, data: { watch_pct, completed }, error: null, message: 'Progress saved' });
  } catch (err) { next(err); }
});
// Get student's attendance for a course
router.get('/my/:courseId', requireRole('student'), async (req, res, next) => {
  try {
    const mods = await db('class_modules').where({ course_id: req.params.courseId }).select('id');
    const data = await db('attendance').where({ student_id: req.user.id, class_type: 'recorded' })
      .whereIn('class_id', mods.map(m => m.id));
    res.json({ success: true, data, error: null, message: 'OK' });
  } catch (err) { next(err); }
});
module.exports = router;
