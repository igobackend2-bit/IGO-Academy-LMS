const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/externalCertificate.controller');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');

// Public — lets anyone open the real issued PDF as proof from the verify page
router.get('/:id/pdf', ctrl.servePdf);

router.use(verifyToken);
router.get('/', requireRole('admin'), ctrl.list);
router.post('/', requireRole('admin'), ctrl.uploadMiddleware, ctrl.create);
router.put('/:id/revoke', requireRole('admin'), ctrl.revoke);

module.exports = router;
