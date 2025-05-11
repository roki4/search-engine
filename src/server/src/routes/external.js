/**
 * @fileoverview Routes for Wikipedia API integration.
 * @module routes/external
 */

const express = require('express');
const axios = require('axios');
const validate = require('../middleware/validate');
const Joi = require('joi');

const router = express.Router();

const wikipediaSchema = Joi.object({
  q: Joi.string().trim().min(1).required(),
});

/**
 * Fetch Wikipedia summary for a query.
 * @name GET/api/wikipedia
 * @function
 * @param {Object} req - Express request object.
 * @param {string} req.query.q - Search query.
 * @param {Object} res - Express response object.
 * @returns {Object} 200 - Wikipedia summary or empty object.
 * @throws {Object} 400 - Invalid query.
 * @throws {Object} 500 - Server error.
 */
router.get('/wikipedia', validate(wikipediaSchema), async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get('https://ru.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(q));
    const summary = response.data.extract ? {
      title: response.data.title,
      extract: response.data.extract,
      url: response.data.content_urls.desktop.page,
    } : {};
    res.status(200).json(summary);
  } catch (error) {
    console.error('Wikipedia API error:', error);
    res.status(200).json({}); // Return empty object if no result
  }
});

module.exports = router;