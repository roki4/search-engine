const express = require('express');
const authRoutes = require('./src/routes/auth');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключаем маршруты
app.use('/api', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
