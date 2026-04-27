const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetLanguage: { type: String, default: 'en' }, // изучаемый язык (для каждой папки)
}, { timestamps: true });

module.exports = mongoose.model('Folder', folderSchema);