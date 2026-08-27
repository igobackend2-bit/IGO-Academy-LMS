const express = require('express');
const multer = require('multer');
const router = express.Router();
const ctrl = require('../controllers/enrollmentRequest.controller');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');

// Optional payment-proof screenshot on a paid-course request — same pattern
// as the course-thumbnail upload in course.controller.js.
const proofUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Only JPEG, PNG, WEBP, or GIF images are allowed'));
  },
});

router.use(verifyToken);

router.post('/', requireRole('student'), proofUpload.single('proof'), ctrl.create);
router.get('/my', requireRole('student'), ctrl.myRequests);
router.get('/', requireRole('admin'), ctrl.list);
router.put('/:id/approve', requireRole('admin'), ctrl.approve);
router.put('/:id/reject', requireRole('admin'), ctrl.reject);

module.exports = router;
