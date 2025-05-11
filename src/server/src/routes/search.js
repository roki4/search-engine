/**
 * @fileoverview Search route for performing Google Custom Search.
 * @module routes/search
 */

const express = require('express');
const axios = require('axios');
const validate = require('../middleware/validate');
const { searchSchema } = require('../validators/searchValidator');

const router = express.Router();

/**
 * Perform a search using Google Custom Search API.
 * @name GET/api/search
 * @function
 * @param {Object} req - Express request object.
 * @param {string} req.query.q - Search query string.
 * @param {number} [req.query.start=1] - Start index for pagination.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - Search results and total count.
 * @throws {Object} 400 - If query or start is invalid.
 * @throws {Object} 500 - Server error.
 */
router.get('/search', validate(searchSchema), async (req, res) => {
  try {
    const { q, start = 1 } = req.query;

    // Additional validation for start
    if (!Number.isInteger(Number(start)) || start < 1) {
      return res.status(400).json({ message: 'Invalid start parameter', results: [], totalResults: 0 });
    }

    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: 'AIzaSyDQm8vZsOUNhdAaOi00pOXpx4w2kCo5IRw',
        cx: '930046ae21e344dc1',
        q,
        start,
      },
    });

    const results = response.data.items
      ? response.data.items.map((item) => ({
          title: item.title,
          url: item.link,
          snippet: item.snippet,
        }))
      : [];

    const totalResults = response.data.searchInformation
      ? parseInt(response.data.searchInformation.totalResults, 10)
      : 0;

    res.status(200).json({ results, totalResults });
  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({ message: 'Server error', results: [], totalResults: 0 });
  }
});

module.exports = router;