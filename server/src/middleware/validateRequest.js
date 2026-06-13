/**
 * validateRequest — runs express-validator results and returns 400 on failure
 * @module middleware/validateRequest
 */
const { validationResult } = require('express-validator');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      error: 'INVALID_INPUT',
      message: errors.array().map((e) => e.msg).join('; '),
    });
  }
  next();
}

module.exports = { validateRequest };
