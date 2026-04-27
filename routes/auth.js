const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { secret, expiresIn } = require('../config/jwt');
const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { username, password, nativeLanguage } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Логин и пароль обязательны' });
    }
    // Проверка на занятость логина
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
    }
    const user = new User({ username, password, nativeLanguage });
    await user.save();

    // Сразу выдаём JWT
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn });
    res.status(201).json({ token, user: { id: user._id, username: user.username, nativeLanguage: user.nativeLanguage } });
  } catch (err) {
  console.error('Ошибка при регистрации:', err);   // ← добавить
  res.status(500).json({ message: 'Ошибка сервера' });
}
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Неверные учетные данные' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверные учетные данные' });
    }
    const token = jwt.sign({ userId: user._id }, secret, { expiresIn });
    res.json({ token, user: { id: user._id, username: user.username, nativeLanguage: user.nativeLanguage } });
  } catch (err) {
    console.error('Ошибка при входе:', err);   // ← добавить
    res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;