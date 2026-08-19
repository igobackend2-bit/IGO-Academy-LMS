const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/enquiry.controller');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { validateRequest } = require('../middleware/validateRequest');

const adminOnly = [verifyToken, requireRole('admin')];

const createRules = [
  body('name').trim().notEmpty().isLength({ min: 2 }).withMessage('Name is required'),
  body('phone').trim().notEmpty().isLength({ min: 8 }).withMessage('A valid phone number is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email must be valid'),
];

router.post('/', createRules, validateRequest, ctrl.create);
router.get('/', ...adminOnly, ctrl.list);
router.patch('/:id', ...adminOnly, ctrl.updateStatus);

module.exports = router;
