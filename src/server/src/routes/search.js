const express = require('express');
const axios = require('axios');
const profileService = require('../services/profileService');
const validate = require('../middleware/validate');
const { searchSchema } = require('../validators/searchValidator');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    next();
  }
};

router.get('/search', validate(searchSchema), isAuthenticated, async (req, res) => {
  try {
    const { q, start = 1 } = req.query;
    if (!q) {
      return res.status(400).json({ results: [], totalResults: 0 });
    }

    if (req.user) {
      await profileService.saveSearchQuery(req.user.id, q);
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
    res.status(500).json({ results: [], totalResults: 0 });
  }
});

module.exports = router;