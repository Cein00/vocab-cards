const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// models/User.js
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  nativeLanguage: { type: String, default: 'ru' },
  speechEnabled: { type: Boolean, default: false },
  defaultFolderLanguage: { type: String, default: 'en' },
  theme: { type: String, default: 'light', enum: ['light', 'dark'] }
}, { timestamps: true });


// Хешируем пароль перед сохранением
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Метод проверки пароля
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);