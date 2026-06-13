const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const CertService = require('../services/certificate.service');
const StorageService = require('../services/storage.service');
const { db } = require('../config/db');
const { createError } = require('../middleware/errorHandler');
// Public verify
router.get('/verify/:certId', async (req, res, next) => {
  try {
    const cert = await CertService.verifyCertificate(req.params.certId);
    if (!cert) return res.status(404).json({ success: false, data: null, error: 'NOT_FOUND', message: 'Certificate not found' });
    res.json({ success: true, data: cert, error: null, message: 'OK' });
  } catch (err) { next(err); }
});
router.use(verifyToken);
// Student: list own certificates
router.get('/my', requireRole('student'), async (req, res, next) => {
  try {
    const data = await db('certificates as c').join('courses as co','c.course_id','co.id')
      .select('c.*','co.title as course_title').where('c.student_id', req.user.id).orderBy('c.issued_at','desc');
    res.json({ success: true, data, error: null, message: 'OK' });
  } catch (err) { next(err); }
});
// Student: get download URL for certificate
router.get('/:id/download', requireRole('student','admin'), async (req, res, next) => {
  try {
    const cert = await db('certificates').where({ id: req.params.id }).first();
    if (!cert) throw createError('NOT_FOUND', 'Certificate not found');
    if (cert.student_id !== req.user.id && req.user.role !== 'admin') throw createError('UNAUTHORIZED','Not your certificate');
    const url = await StorageService.getSignedUrl(cert.pdf_s3_key, StorageService.BUCKET_CERTS);
    res.json({ success: true, data: { url }, error: null, message: 'OK' });
  } catch (err) { next(err); }
});
// Admin: list all certificates
router.get('/', requireRole('admin'), async (req, res, next) => {
  try {
    const data = await db('certificates as c').join('users as u','c.student_id','u.id').join('courses as co','c.course_id','co.id')
      .select('c.*','u.full_name','u.email','co.title as course_title').orderBy('c.issued_at','desc').limit(200);
    res.json({ success: true, data, error: null, message: 'OK' });
  } catch (err) { next(err); }
});
// Admin: revoke
router.put('/:id/revoke', requireRole('admin'), async (req, res, next) => {
  try {
    await db('certificates').where({ id: req.params.id }).update({ is_valid: false, revoked_reason: req.body.reason, revoked_by: req.user.id, revoked_at: db.fn.now() });
    res.json({ success: true, data: null, error: null, message: 'Certificate revoked' });
  } catch (err) { next(err); }
});
module.exports = router;
