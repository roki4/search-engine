const express = require('express');
const authRoutes = require('./src/routes/auth');
const searchRoutes = require('./src/routes/search');
const profileRoutes = require('./src/routes/profile');
const externalRoutes = require('./src/routes/external');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.user = req.headers['x-user'] ? JSON.parse(req.headers['x-user']) : null;
  next();
});

app.use('/api', authRoutes);
app.use('/api', searchRoutes);
app.use('/api', profileRoutes);
app.use('/api', externalRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
