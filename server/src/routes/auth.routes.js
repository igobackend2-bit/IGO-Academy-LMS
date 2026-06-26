/**
 * Auth routes
 * POST /api/auth/login
 * POST /api/auth/logout
 * GET  /api/auth/me
 * POST /api/auth/forgot-password
 * POST /api/auth/verify-otp
 * POST /api/auth/change-password
 */
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');
const { validateRequest } = require('../middleware/validateRequest');

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
];
const registerRules = [
  body('full_name').trim().notEmpty().isLength({ min: 2 }).withMessage('Full name required (min 2 characters)'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').trim().notEmpty().withMessage('Phone number required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];
const otpRules = [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('new_password').isLength({ min: 6 }).withMessage('New password min 6 characters'),
];

router.post('/login',           loginRules, validateRequest, authCtrl.login);
router.post('/register',        registerRules, validateRequest, authCtrl.register);
router.post('/logout',          verifyToken, authCtrl.logout);
router.get('/me',               verifyToken, authCtrl.getMe);
router.post('/forgot-password', body('email').isEmail(), validateRequest, authCtrl.forgotPassword);
router.post('/verify-otp',      otpRules, validateRequest, authCtrl.verifyOtp);
router.post('/change-password', verifyToken,
  body('current_password').notEmpty(),
  body('new_password').isLength({ min: 6 }),
  validateRequest, authCtrl.changePassword
);

module.exports = router;
