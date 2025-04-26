const express = require('express');
const authService = require('../services/authService');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, surname, email, password } = req.body;

  try {
    await authService.register({ name, surname, email, password });
    res.status(201).json({ message: 'Пользователь успешно зарегистрирован!' });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    if (error.message === 'EMAIL_EXISTS') {
      return res.status(400).json({ message: 'Этот email уже зарегистрирован!' });
    }
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await authService.login({ email, password });
    res.status(200).json({ 
      message: 'Успешный вход!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    res.status(200).json({ message: 'Успешный выход' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;