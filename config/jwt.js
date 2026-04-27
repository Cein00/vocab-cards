module.exports = {
  secret: process.env.JWT_SECRET,
  expiresIn: '7d', // токен живёт 7 дней
};