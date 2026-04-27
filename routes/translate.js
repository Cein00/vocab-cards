const express = require('express');
const auth = require('../middleware/authMiddleware');
const axios = require('axios');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;
    if (!text || !sourceLanguage || !targetLanguage) {
      return res.status(400).json({ message: 'text, sourceLanguage, targetLanguage required' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ message: 'AI translation is not configured. Please add DEEPSEEK_API_KEY to .env' });
    }

    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Only output the translated text, nothing else.\n\nText: "${text}"\nTranslation:`;

    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.2,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const translation = response.data.choices[0].message.content.trim();
    res.json({ translation });
  } catch (error) {
    console.error('Translate error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Translation request failed' });
  }
});

module.exports = router;