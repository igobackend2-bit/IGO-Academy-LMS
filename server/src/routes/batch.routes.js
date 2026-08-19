const express   = require('express');
const router    = express.Router();
const ctrl      = require('../controllers/batch.controller');
const verifyToken  = require('../middleware/verifyToken');
const requireRole  = require('../middleware/requireRole');

const adminOnly = [verifyToken, requireRole('admin')];

router.get('/public/upcoming', ctrl.publicUpcoming); // no auth — homepage

router.get('/all',    ...adminOnly, ctrl.listAll);
router.get('/',       ...adminOnly, ctrl.list);
router.post('/',      ...adminOnly, ctrl.findOrCreate);
router.put('/:id',    ...adminOnly, ctrl.update);
router.delete('/:id', ...adminOnly, ctrl.remove);

module.exports = router;
