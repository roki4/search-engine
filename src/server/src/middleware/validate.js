/**
 * @fileoverview Middleware for validating request data using Joi schemas.
 * @module middleware/validate
 */

/**
 * Middleware to validate request data against a Joi schema.
 * @function
 * @param {Object} schema - Joi validation schema.
 * @returns {Function} Express middleware function.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @throws {Object} 400 - If validation fails.
 */
const validate = (schema) => (req, res, next) => {
  const data = req.method === 'GET' ? req.query : req.body;
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    const errors = error.details.map((err) => err.message);
    return res.status(400).json({ message: 'Validation error', errors });
  }
  next();
};

module.exports = validate;