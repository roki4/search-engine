const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    const start = parseInt(req.query.start, 10) || 1; // Индекс начала (1-based)
    if (!query) {
      return res.status(400).json({ results: [], totalResults: 0 });
    }

    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: 'AIzaSyDQm8vZsOUNhdAaOi00pOXpx4w2kCo5IRw', // Замените на ваш API ключ
        cx: '930046ae21e344dc1', // Ваш Search Engine ID
        q: query,
        start: start,
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
    console.error('Ошибка при поиске:', error);
    res.status(500).json({ results: [], totalResults: 0 });
  }
});

module.exports = router;