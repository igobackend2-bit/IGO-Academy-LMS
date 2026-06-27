const path = require('path');
const fs   = require('fs');
const multer = require('multer');
const { db } = require('../config/db');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/resources');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/* ── Multer — disk storage, PDF only, 20 MB limit ── */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, _file, cb) => cb(null, `${req.params.id}.pdf`),
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    file.mimetype === 'application/pdf'
      ? cb(null, true)
      : cb(new Error('Only PDF files are allowed'));
  },
});
exports.uploadMiddleware = upload.single('pdf');

/* ── Admin: list all resources (with course + batch names) ── */
exports.list = async (req, res, next) => {
  try {
    const { type } = req.query;
    const q = db('resources as r')
      .select(
        'r.*',
        'u.full_name as created_by_name',
        'c.title as course_title',
        'b.name as batch_name'
      )
      .leftJoin('users as u',   'u.id', 'r.created_by')
      .leftJoin('courses as c', 'c.id', 'r.course_id')
      .leftJoin('batches as b', 'b.id', 'r.batch_id')
      .orderBy('r.display_order')
      .orderBy('r.created_at', 'desc');
    if (type) q.where('r.type', type);
    const rows = await q;
    res.json({ success: true, data: rows, error: null, message: 'OK' });
  } catch (e) { next(e); }
};

/* ── Admin: create ── */
exports.create = async (req, res, next) => {
  try {
    const { type, title, content, course_id, batch_id, display_order } = req.body;
    if (!type || !title)
      return res.status(400).json({ success: false, data: null, error: 'VALIDATION', message: 'type and title are required' });
    const [row] = await db('resources').insert({
      type, title, content: content || '',
      course_id: course_id || null,
      batch_id:  batch_id  || null,
      display_order: display_order ?? 0,
      created_by: req.user.id,
    }).returning('*');
    res.status(201).json({ success: true, data: row, error: null, message: 'Resource created' });
  } catch (e) { next(e); }
};

/* ── Admin: update ── */
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, course_id, batch_id, display_order, is_active } = req.body;
    const [row] = await db('resources').where({ id }).update({
      title, content,
      course_id: course_id || null,
      batch_id:  batch_id  || null,
      display_order: display_order ?? 0,
      is_active: is_active ?? true,
      updated_at: db.fn.now(),
    }).returning('*');
    if (!row) return res.status(404).json({ success: false, data: null, error: 'NOT_FOUND', message: 'Resource not found' });
    res.json({ success: true, data: row, error: null, message: 'Updated' });
  } catch (e) { next(e); }
};

/* ── Admin: upload PDF ── */
exports.uploadPdf = async (req, res, next) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, data: null, error: 'NO_FILE', message: 'No PDF file provided' });
    const [row] = await db('resources').where({ id: req.params.id })
      .update({ pdf_path: req.file.filename, updated_at: db.fn.now() })
      .returning('id', 'pdf_path');
    if (!row) return res.status(404).json({ success: false, data: null, error: 'NOT_FOUND', message: 'Resource not found' });
    res.json({ success: true, data: row, error: null, message: 'PDF uploaded' });
  } catch (e) { next(e); }
};

/* ── Admin: remove PDF only ── */
exports.removePdf = async (req, res, next) => {
  try {
    const row = await db('resources').where({ id: req.params.id }).first('pdf_path');
    if (!row) return res.status(404).json({ success: false, data: null, error: 'NOT_FOUND', message: 'Not found' });
    if (row.pdf_path) {
      const filePath = path.join(UPLOAD_DIR, row.pdf_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db('resources').where({ id: req.params.id }).update({ pdf_path: null, updated_at: db.fn.now() });
    res.json({ success: true, data: null, error: null, message: 'PDF removed' });
  } catch (e) { next(e); }
};

/* ── Admin: delete resource ── */
exports.remove = async (req, res, next) => {
  try {
    const row = await db('resources').where({ id: req.params.id }).first('pdf_path');
    if (row?.pdf_path) {
      const filePath = path.join(UPLOAD_DIR, row.pdf_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db('resources').where({ id: req.params.id }).delete();
    res.json({ success: true, data: null, error: null, message: 'Deleted' });
  } catch (e) { next(e); }
};

/* ── Serve PDF (admin + student, inline) ── */
exports.servePdf = async (req, res, next) => {
  try {
    const row = await db('resources').where({ id: req.params.id }).first('pdf_path', 'title', 'is_active');
    if (!row) return res.status(404).send('Not found');
    if (req.user.role === 'student' && !row.is_active)
      return res.status(403).send('Access denied');
    if (!row.pdf_path) return res.status(404).send('No PDF attached');
    const filePath = path.join(UPLOAD_DIR, row.pdf_path);
    if (!fs.existsSync(filePath)) return res.status(404).send('File missing');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(row.title)}.pdf"`);
    res.setHeader('Cache-Control', 'no-store, no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    fs.createReadStream(filePath).pipe(res);
  } catch (e) { next(e); }
};

/* ── Student: view resources filtered by their enrollments ── */
exports.studentList = async (req, res, next) => {
  try {
    const { type } = req.query;
    const studentId = req.user.id;

    // Get student's active enrollments (course_id + batch_id)
    const enrollments = await db('enrollments')
      .where({ student_id: studentId, is_expired: false })
      .select('course_id', 'batch_id');

    const courseIds = enrollments.map(e => e.course_id);
    const batchIds  = enrollments.filter(e => e.batch_id).map(e => e.batch_id);

    const q = db('resources as r')
      .leftJoin('courses as c', 'c.id', 'r.course_id')
      .leftJoin('batches as b',  'b.id', 'r.batch_id')
      .where({ 'r.is_active': true })
      .where(function () {
        // Global (no course): visible to all
        this.whereNull('r.course_id');
        // Course-specific: only if student is enrolled
        if (courseIds.length > 0) {
          this.orWhere(function () {
            this.whereIn('r.course_id', courseIds)
              .where(function () {
                // All batches of that course
                this.whereNull('r.batch_id');
                // OR specific batch the student belongs to
                if (batchIds.length > 0) {
                  this.orWhereIn('r.batch_id', batchIds);
                }
              });
          });
        }
      })
      .orderBy('r.display_order')
      .orderBy('r.created_at', 'desc');

    if (type) q.where('r.type', type);

    const rows = await q.select(
      'r.id', 'r.type', 'r.title', 'r.content', 'r.pdf_path',
      'r.display_order', 'r.created_at', 'r.course_id', 'r.batch_id',
      'c.title as course_title',
      'b.name as batch_name'
    );

    res.json({ success: true, data: rows, error: null, message: 'OK' });
  } catch (e) { next(e); }
};
