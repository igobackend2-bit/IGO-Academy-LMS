/**
 * requireRole middleware — restricts route to specific user roles
 * Must be used after verifyToken
 * @module middleware/requireRole
 */
const { createError } = require('./errorHandler');

/**
 * @param {...('admin'|'trainer'|'student')} roles
 * @returns {import('express').RequestHandler}
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(createError('UNAUTHORIZED', 'Authentication required'));
    if (!roles.includes(req.user.role)) {
      return next(createError('UNAUTHORIZED', `Access restricted to: ${roles.join(', ')}`));
    }
    next();
  };
}

module.exports = requireRole;
