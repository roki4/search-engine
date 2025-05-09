/**
 * @fileoverview Validation schemas for search routes using Joi.
 * @module validators/searchValidator
 */

const Joi = require('joi');

/**
 * Schema for search query validation.
 * @type {Object}
 */
const searchSchema = Joi.object({
  q: Joi.string().min(1).required().messages({
    'string.min': 'Search query must be at least 1 character long',
    'any.required': 'Search query is required',
  }),
  start: Joi.number().integer().min(1).default(1).messages({
    'number.min': 'Start must be at least 1',
    'number.integer': 'Start must be an integer',
  }),
});

module.exports = {
  searchSchema,
};
