const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  term: { type: String, required: true },          // слово на изучаемом языке
  translation: { type: String, required: true },   // перевод на родной язык
  image: { type: String, default: '' },           // URL или base64 (опционально)
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);