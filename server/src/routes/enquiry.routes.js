const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/enquiry.controller');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { validateRequest } = require('../middleware/validateRequest');

const adminOnly = [verifyToken, requireRole('admin')];
const executiveOnly = [verifyToken, requireRole('executive')];
// Status/note updates on one lead are shared by admin (any lead) and
// executive (their own assigned lead only — enforced inside the controller,
// since the route alone can't know which lead a given :id belongs to).
const adminOrExecutive = [verifyToken, requireRole('admin', 'executive')];

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

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
router.post('/admin-create', ...adminOnly, ctrl.adminCreate);
router.post('/bulk-import', ...adminOnly, upload.single('file'), ctrl.bulkImport);
router.patch('/bulk-assign', ...adminOnly, ctrl.bulkAssign);
router.patch('/:id/assign', ...adminOnly, ctrl.assign);

router.get('/my', ...executiveOnly, ctrl.myLeads);

router.patch('/:id', ...adminOrExecutive, ctrl.updateStatus);

module.exports = router;
