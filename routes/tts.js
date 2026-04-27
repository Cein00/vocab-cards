const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
  const { text, lang } = req.query;
  if (!text || !lang) {
    return res.status(400).json({ error: 'text and lang required' });
  }

  const ttsUrl = `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=${lang}&client=gtx&q=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(ttsUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!response.ok) throw new Error(`Google TTS status ${response.status}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=86400'
    });
    res.send(buffer);
  } catch (err) {
    console.error('TTS proxy error:', err.message);
    res.status(500).json({ error: 'Failed to fetch TTS audio' });
  }
});

module.exports = router;