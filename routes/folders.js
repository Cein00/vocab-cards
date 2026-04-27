const express = require('express');
const Folder = require('../models/Folder');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Все папки пользователя
router.get('/', auth, async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(folders);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка загрузки папок' });
  }
});

// Создать папку
router.post('/', auth, async (req, res) => {
  try {
    const { name, targetLanguage } = req.body;
    if (!name) return res.status(400).json({ message: 'Название обязательно' });
    const folder = new Folder({ name, user: req.userId, targetLanguage: targetLanguage || 'en' });
    await folder.save();
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка создания папки' });
  }
});

// Обновить папку (переименовать или сменить язык)
router.put('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: { name: req.body.name, targetLanguage: req.body.targetLanguage } },
      { new: true }
    );
    if (!folder) return res.status(404).json({ message: 'Папка не найдена' });
    res.json(folder);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка обновления' });
  }
});

// Удалить папку (и все карточки внутри)
router.delete('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!folder) return res.status(404).json({ message: 'Папка не найдена' });
    // Каскадное удаление карточек
    await Card.deleteMany({ folder: folder._id });
    res.json({ message: 'Папка удалена' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка удаления' });
  }
});

module.exports = router;