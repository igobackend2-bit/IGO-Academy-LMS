const express = require('express');
const router = express.Router();
const courseCtrl = require('../controllers/course.controller');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const checkCourseExpiry = require('../middleware/checkCourseExpiry');

// ── Public routes (no auth required) ──────────────────────────
router.get('/public', courseCtrl.listPublic);

// ── Authenticated routes ───────────────────────────────────────
router.use(verifyToken);
router.get('/', courseCtrl.list);
router.get('/:id', checkCourseExpiry, courseCtrl.getOne);
router.post('/', requireRole('admin'), courseCtrl.create);
router.post('/thumbnail-upload', requireRole('admin'), courseCtrl.uploadThumbnailMiddleware, courseCtrl.uploadThumbnail);
router.put('/:id', requireRole('admin'), courseCtrl.update);
router.delete('/:id', requireRole('admin'), courseCtrl.deactivate);
router.delete('/:id/permanent', requireRole('admin'), courseCtrl.remove);
router.post('/:id/modules', requireRole('admin','trainer'), courseCtrl.upsertModule);
router.delete('/modules/:moduleId', requireRole('admin','trainer'), courseCtrl.deleteModule);
router.get('/modules/:moduleId/upload-url', requireRole('admin','trainer'), courseCtrl.getUploadUrl);
router.get('/modules/:moduleId/stream-url', checkCourseExpiry, courseCtrl.getStreamUrl);
router.get('/modules/:moduleId/video', verifyToken, courseCtrl.serveLocalVideo);
module.exports = router;
