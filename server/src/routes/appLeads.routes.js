const express = require('express');
const router  = express.Router();
const verifyToken  = require('../middleware/verifyToken');
const requireRole  = require('../middleware/requireRole');
const ctrl = require('../controllers/appLeads.controller');

const adminOnly = [verifyToken, requireRole('admin')];

router.get ('/',           ...adminOnly, ctrl.list);
router.put ('/:id/approve', ...adminOnly, ctrl.approve);
router.put ('/:id/reject',  ...adminOnly, ctrl.reject);

module.exports = router;
