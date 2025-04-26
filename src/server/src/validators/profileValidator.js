const Joi = require('joi');

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).required().messages({
    'string.min': 'Old password must be at least 6 characters long',
    'any.required': 'Old password is required',
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password is required',
  }),
});

module.exports = {
  changePasswordSchema,
};