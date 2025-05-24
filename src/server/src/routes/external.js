/**
      * @fileoverview Routes for Wikipedia and AI API integration via OpenRouter.
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

const aiSchema = Joi.object({
  q: Joi.string().trim().min(1).required(),
});

/**
 * Fetch Wikipedia summary for a query.
 * @name GET/api/wikipedia
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
    res.status(200).json({});
  }
});

/**
 * Fetch AI response from DeepSeek R1 via OpenRouter.
 * @name GET/api/ai
 */
router.get('/ai', validate(aiSchema), async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-r1:free',
        messages: [{ role: 'user', content: q }],
      },
      {
        headers: {
          Authorization: 'Bearer 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',
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Quirk Search',
        },
      }
    );
    console.log('response:\n',response)
    const text = response.data.choices[0]?.message?.content || '';
    res.status(200).json({ text: text || '' });
  } catch (error) {
    console.error('OpenRouter API error:', error.message);
    res.status(200).json({ text: '' });
  }
});

module.exports = router;