const express = require('express');
const Card = require('../models/Card');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Все карточки конкретной папки
router.get('/', auth, async (req, res) => {
  try {
    const { folderId } = req.query;
    if (!folderId) return res.status(400).json({ message: 'folderId обязателен' });
    // Проверяем, что папка принадлежит пользователю
    const cards = await Card.find({ folder: folderId, user: req.userId }).sort({ createdAt: -1 });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка загрузки карточек' });
  }
});

// Создать карточку
router.post('/', auth, async (req, res) => {
  try {
    const { folderId, term, translation, image } = req.body;
    if (!folderId || !term || !translation) {
      return res.status(400).json({ message: 'folderId, term, translation обязательны' });
    }
    const card = new Card({
      folder: folderId,
      user: req.userId,
      term,
      translation,
      image: image || '',
    });
    await card.save();
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка создания карточки' });
  }
});

// Обновить карточку
router.put('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: { term: req.body.term, translation: req.body.translation, image: req.body.image } },
      { new: true }
    );
    if (!card) return res.status(404).json({ message: 'Карточка не найдена' });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка обновления' });
  }
});

// Удалить карточку
router.delete('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!card) return res.status(404).json({ message: 'Карточка не найдена' });
    res.json({ message: 'Карточка удалена' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка удаления' });
  }
});

module.exports = router;