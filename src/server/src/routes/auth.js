/**
 * @fileoverview Authentication routes for user registration, login, logout, and profile retrieval.
 * @module routes/auth
 */

const express = require('express');
const authService = require('../services/authService');
const userRepository = require('../repositories/userRepository');
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
 * @returns {Object} 200 - Success message and user data (id, name, surname, email).
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
        surname: user.surname,
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
 * Get the current user's profile.
 * @name GET/api/profile
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} req.headers['x-user'] - JSON string of user data.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - User data (id, name, surname, email).
 * @throws {Object} 400 - If user data is invalid.
 * @throws {Object} 404 - If user not found.
 * @throws {Object} 500 - Server error.
 */
router.get('/profile', async (req, res) => {
  try {
    const userData = req.headers['x-user'];
    if (!userData) {
      return res.status(400).json({ message: 'User data not provided' });
    }

    const user = JSON.parse(userData);
    if (!user.id) {
      return res.status(400).json({ message: 'Invalid user data' });
    }

    const dbUser = await userRepository.findById(user.id);
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: dbUser.id,
      name: dbUser.name,
      surname: dbUser.surname,
      email: dbUser.email,
    });
  } catch (error) {
    console.error('Error retrieving profile:', error);
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