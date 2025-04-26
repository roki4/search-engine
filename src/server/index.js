const express = require('express');
const authRoutes = require('./src/routes/auth');
const searchRoutes = require('./src/routes/search');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', authRoutes);
app.use('/api', searchRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
