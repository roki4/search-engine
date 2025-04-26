/**
 * @fileoverview Profile routes for password change and search history retrieval.
 * @module routes/profile
 */

const express = require('express');
const authService = require('../services/authService');
const profileService = require('../services/profileService');
const validate = require('../middleware/validate');
const { changePasswordSchema } = require('../validators/profileValidator');

const router = express.Router();

/**
 * Middleware to check if user is authenticated.
 * @name isAuthenticated
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void}
 * @throws {Object} 401 - If user is not authenticated.
 */
const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

/**
 * Change the user's password.
 * @name POST/api/change-password
 * @function
 * @param {Object} req - Express request object.
 * @param {string} req.body.oldPassword - Current password.
 * @param {string} req.body.newPassword - New password.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - Success message.
 * @throws {Object} 400 - If old password is invalid.
 * @throws {Object} 401 - If user is not authenticated.
 * @throws {Object} 500 - Server error.
 */
router.post('/change-password', isAuthenticated, validate(changePasswordSchema), async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    await authService.changePassword(req.user.id, oldPassword, newPassword);
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    if (error.message === 'INVALID_PASSWORD') {
      return res.status(400).json({ message: 'Invalid current password' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Retrieve the user's search history.
 * @name GET/api/search-history
 * @function
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - Array of search history entries.
 * @throws {Object} 401 - If user is not authenticated.
 * @throws {Object} 500 - Server error.
 */
router.get('/search-history', isAuthenticated, async (req, res) => {
  try {
    const history = await profileService.getSearchHistory(req.user.id);
    res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;