require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const authRoutes = require('./routes/auth');
const folderRoutes = require('./routes/folders');
const cardRoutes = require('./routes/cards');

const app = express();

// Подключаем БД
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Раздача статических файлов фронтенда (index.html, CSS, JS)
app.use(express.static(path.join(__dirname, 'frontend')));

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/tts', require('./routes/tts'));

// Catch-all: для любого несовпавшего маршрута (SPA) отдаём index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));