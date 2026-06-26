const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/enrollmentRequest.controller');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');

router.use(verifyToken);

router.post('/', requireRole('student'), ctrl.create);
router.get('/my', requireRole('student'), ctrl.myRequests);
router.get('/', requireRole('admin'), ctrl.list);
router.put('/:id/approve', requireRole('admin'), ctrl.approve);
router.put('/:id/reject', requireRole('admin'), ctrl.reject);

module.exports = router;
