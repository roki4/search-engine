const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required',
  }),
  surname: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Surname must be at least 2 characters long',
    'string.max': 'Surname cannot exceed 50 characters',
    'any.required': 'Surname is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const logoutSchema = Joi.object({}).unknown(true); // Пустая схема, так как тело не требуется

module.exports = {
  registerSchema,
  loginSchema,
  logoutSchema,
};