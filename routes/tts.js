const express = require('express');
const router = express.Router();
const googleTTS = require('google-tts-api');
const axios = require('axios');

router.get('/', async (req, res) => {
  let { text, lang } = req.query;

  if (!text || !lang) {
    return res.status(400).json({ error: 'text and lang required' });
  }

  try {
    // ВЕНГЕРСКИЙ ХАК: 
    // Если язык венгерский, меняем 'a' на 'o' (потому что в hu 'a' звучит как глубокое 'o')
    // Но не трогаем 'á' (которая звучит как чистое 'а')
    let processedText = text;
    if (lang === 'hu') {
      processedText = text.replace(/a/g, 'o');
    }

    const url = googleTTS.getAudioUrl(processedText, {
      lang: lang,
      slow: false,
      host: 'https://translate.google.com',
    });

    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    res.set({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400'
    });

    response.data.pipe(res);
  } catch (err) {
    console.error('TTS Error:', err.message);
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;