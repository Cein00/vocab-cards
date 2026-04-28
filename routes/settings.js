// routes/settings.js
const express = require('express');
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

// GET /api/user/settings – получить настройки текущего пользователя
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('nativeLanguage speechEnabled defaultFolderLanguage');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json({
      nativeLanguage: user.nativeLanguage,
      speechEnabled: user.speechEnabled,
      defaultFolderLanguage: user.defaultFolderLanguage,
    });
  } catch (err) {
    console.error('GET /user/settings error:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// PUT /api/user/settings – обновить настройки
router.put('/', auth, async (req, res) => {
  try {
    const { nativeLanguage, speechEnabled, defaultFolderLanguage } = req.body;
    const update = {};
    if (nativeLanguage !== undefined) update.nativeLanguage = nativeLanguage;
    if (speechEnabled !== undefined) update.speechEnabled = speechEnabled;
    if (defaultFolderLanguage !== undefined) update.defaultFolderLanguage = defaultFolderLanguage;

    const user = await User.findByIdAndUpdate(req.userId, { $set: update }, { new: true }).select('nativeLanguage speechEnabled defaultFolderLanguage');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json({
      nativeLanguage: user.nativeLanguage,
      speechEnabled: user.speechEnabled,
      defaultFolderLanguage: user.defaultFolderLanguage,
    });
  } catch (err) {
    console.error('PUT /user/settings error:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;