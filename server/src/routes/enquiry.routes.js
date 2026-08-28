const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/enquiry.controller');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { validateRequest } = require('../middleware/validateRequest');

const adminOnly = [verifyToken, requireRole('admin')];

const createRules = [
  body('name').trim().notEmpty().isLength({ min: 2, max: 150 }).withMessage('Name is required'),
  body('phone').trim().notEmpty().isLength({ min: 8, max: 20 }).withMessage('A valid phone number is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email must be valid'),
  body('location').optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body('course_interested').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
  body('candidate_type').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('preferred_mode').optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
  body('message').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
  body('source').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('recaptcha_token').optional({ checkFalsy: true }).isString().isLength({ max: 5000 }),
];

router.post('/', createRules, validateRequest, ctrl.create);
router.get('/', ...adminOnly, ctrl.list);
router.patch('/:id', ...adminOnly, ctrl.updateStatus);

module.exports = router;
