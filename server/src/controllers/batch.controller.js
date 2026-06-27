const { db } = require('../config/db');

/* ── List batches for a course ── */
exports.list = async (req, res, next) => {
  try {
    const { course_id } = req.query;
    if (!course_id) return res.status(400).json({ success: false, data: null, error: 'VALIDATION', message: 'course_id is required' });
    const rows = await db('batches').where({ course_id }).orderBy('created_at', 'desc');
    res.json({ success: true, data: rows, error: null, message: 'OK' });
  } catch (e) { next(e); }
};

/* ── Find-or-create a batch by name for a course ── */
exports.findOrCreate = async (req, res, next) => {
  try {
    const { course_id, name, start_date, end_date } = req.body;
    if (!course_id || !name) return res.status(400).json({ success: false, data: null, error: 'VALIDATION', message: 'course_id and name are required' });
    const existing = await db('batches').where({ course_id, name }).first();
    if (existing) return res.json({ success: true, data: existing, error: null, message: 'Found' });
    const [row] = await db('batches').insert({ course_id, name, start_date: start_date || null, end_date: end_date || null }).returning('*');
    res.status(201).json({ success: true, data: row, error: null, message: 'Batch created' });
  } catch (e) { next(e); }
};
