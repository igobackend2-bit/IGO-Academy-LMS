const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/batch.controller');
const verifyToken  = require('../middleware/verifyToken');
const requireRole  = require('../middleware/requireRole');

router.get('/',  verifyToken, requireRole('admin'), ctrl.list);
router.post('/', verifyToken, requireRole('admin'), ctrl.findOrCreate);

module.exports = router;
