/**
 * @fileoverview Profile routes for password change, search history, autocomplete, and spellcheck.
 * @module routes/profile
 */

const express = require('express');
const axios = require('axios');
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

/**
 * Retrieve suggestions for autocompletion based on user's search history.
 * @name GET/api/autocomplete
 * @function
 * @param {Object} req - Express request object.
 * @param {string} [req.query.q] - Partial search query for filtering.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - Array of unique query suggestions.
 * @throws {Object} 401 - If user is not authenticated.
 * @throws {Object} 500 - Server error.
 */
router.get('/autocomplete', isAuthenticated, async (req, res) => {
  try {
    const { q } = req.query;
    const history = await profileService.getSearchHistory(req.user.id);
    let suggestions = history.map((item) => item.query);
    
    // Remove duplicates
    suggestions = [...new Set(suggestions)];
    
    // Filter by partial match if q is provided
    if (q) {
      suggestions = suggestions.filter((query) => 
        query.toLowerCase().includes(q.toLowerCase())
      );
    }
    
    // Limit to 5 suggestions
    suggestions = suggestions.slice(0, 5);
    
    res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Retrieve external autocomplete suggestions via Google Suggest API.
 * @name GET/api/external-autocomplete
 * @function
 * @param {Object} req - Express request object.
 * @param {string} req.query.q - Partial search query.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - Array of query suggestions.
 * @throws {Object} 400 - If query is missing.
 * @throws {Object} 500 - Server error.
 */
router.get('/external-autocomplete', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ suggestions: [] });
    }

    const response = await axios.get('http://suggestqueries.google.com/complete/search', {
      params: {
        client: 'firefox',
        q,
      },
    });

    const suggestions = response.data[1] || [];
    res.status(200).json({ suggestions: suggestions.slice(0, 5) });
  } catch (error) {
    console.error('Error fetching external autocomplete suggestions:', error);
    res.status(500).json({ suggestions: [] });
  }
});

/**
 * Delete a specific search query from user's history.
 * @name DELETE/api/search-history
 * @function
 * @param {Object} req - Express request object.
 * @param {string} req.query.query - Search query to delete.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - Success message.
 * @throws {Object} 400 - If query is missing.
 * @throws {Object} 401 - If user is not authenticated.
 * @throws {Object} 500 - Server error.
 */
router.delete('/search-history', isAuthenticated, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    await profileService.deleteSearchQuery(req.user.id, query);
    res.status(200).json({ message: 'Search query deleted successfully' });
  } catch (error) {
    console.error('Error deleting search query:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Check spelling of a search query using Yandex Speller API.
 * @name GET/api/spellcheck
 * @function
 * @param {Object} req - Express request object.
 * @param {string} req.query.q - Search query to check.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - Corrected query or original if no corrections.
 * @throws {Object} 400 - If query is missing.
 * @throws {Object} 500 - Server error.
 */
router.get('/spellcheck', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ corrected: q });
    }

    const response = await axios.get('https://speller.yandex.net/services/spellservice.json/checkText', {
      params: {
        text: q,
        lang: 'ru,en',
        options: 4, // Ignore capitalization
      },
    });

    let corrected = q;
    if (response.data && response.data.length > 0) {
      const words = q.split(' ');
      let wordIndex = 0;
      let charIndex = 0;
      let result = '';

      for (let i = 0; i < q.length; i++) {
        if (wordIndex < response.data.length && charIndex === response.data[wordIndex].pos) {
          const correction = response.data[wordIndex];
          if (correction.s && correction.s.length > 0) {
            result += correction.s[0];
            charIndex += correction.len;
            i += correction.len - 1;
          } else {
            result += q[i];
            charIndex++;
          }
          wordIndex++;
        } else {
          result += q[i];
          charIndex++;
          if (q[i] === ' ') {
            charIndex = 0;
            wordIndex = response.data.findIndex((c) => c.pos > charIndex) || wordIndex;
          }
        }
      }
      corrected = result;
    }

    res.status(200).json({ corrected });
  } catch (error) {
    console.error('Error checking spelling:', error);
    res.status(500).json({ corrected: req.query.q });
  }
});

module.exports = router;