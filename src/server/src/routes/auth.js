/**
 * @fileoverview Authentication routes for user registration, login, and logout.
 * @module routes/auth
 */

const express = require('express');
const authService = require('../services/authService');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, logoutSchema } = require('../validators/authValidator');

const router = express.Router();

/**
 * Register a new user.
 * @name POST/api/register
 * @function
 * @param {Object} req - Express request object.
 * @param {string} req.body.name - User's name.
 * @param {string} req.body.surname - User's surname.
 * @param {string} req.body.email - User's email.
 * @param {string} req.body.password - User's password.
 * @param {Object} res - Express response object.
 * @returns {Object} 201 - Success message.
 * @throws {Object} 400 - If email already exists.
 * @throws {Object} 500 - Server error.
 */
router.post('/register', validate(registerSchema), async (req, res) => {
  const { name, surname, email, password } = req.body;
  try {
    await authService.register({ name, surname, email, password });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    if (error.message === 'EMAIL_EXISTS') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Log in an existing user.
 * @name POST/api/login
 * @function
 * @param {Object} req - Express request object.
 * @param {string} req.body.email - User's email.
 * @param {string} req.body.password - User's password.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - Success message and user data (id, name, email).
 * @throws {Object} 401 - If credentials are invalid.
 * @throws {Object} 500 - Server error.
 */
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authService.login({ email, password });
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Log out the current user.
 * @name POST/api/logout
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - Success message.
 * @throws {Object} 500 - Server error.
 */
router.post('/logout', validate(logoutSchema), async (req, res) => {
  try {
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;