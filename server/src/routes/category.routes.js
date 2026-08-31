const express = require('express');
const router  = express.Router();
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const ctrl = require('../controllers/category.controller');

const adminOnly = [verifyToken, requireRole('admin')];

// Read is admin-only for now (same as the rest of the admin panel's data
// endpoints) — Course Edit's category dropdown is only reachable by an
// admin anyway, and the public course catalog still gets category names
// via each course's own `category` field, not this endpoint.
router.get   ('/',      ...adminOnly, ctrl.list);
router.post  ('/',      ...adminOnly, ctrl.create);
router.put   ('/:id',   ...adminOnly, ctrl.update);
router.delete('/:id',   ...adminOnly, ctrl.remove);

module.exports = router;
