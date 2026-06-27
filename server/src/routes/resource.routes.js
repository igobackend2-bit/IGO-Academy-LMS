const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/resource.controller');
const verifyToken  = require('../middleware/verifyToken');
const requireRole  = require('../middleware/requireRole');

// Student — view active resources (view-only)
router.get('/student', verifyToken, requireRole('student'), ctrl.studentList);

// Serve PDF inline — admin + student (auth required, no public access)
router.get('/:id/pdf', verifyToken, requireRole('admin', 'student'), ctrl.servePdf);

// Admin — full CRUD
router.get('/',        verifyToken, requireRole('admin'), ctrl.list);
router.post('/',       verifyToken, requireRole('admin'), ctrl.create);
router.put('/:id',     verifyToken, requireRole('admin'), ctrl.update);
router.delete('/:id',  verifyToken, requireRole('admin'), ctrl.remove);

// Admin — PDF management
router.post('/:id/pdf',   verifyToken, requireRole('admin'), ctrl.uploadMiddleware, ctrl.uploadPdf);
router.delete('/:id/pdf', verifyToken, requireRole('admin'), ctrl.removePdf);

module.exports = router;
