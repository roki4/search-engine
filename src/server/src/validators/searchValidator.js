const Joi = require('joi');

const searchSchema = Joi.object({
  q: Joi.string().trim().min(1).required(),
  start: Joi.number().integer().min(1).default(1),
});

module.exports = { searchSchema };