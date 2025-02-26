const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();
const SALT_ROUNDS = 10;

router.post('/register', async (req, res) => {
  const { name, surname, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Этот email уже зарегистрирован!' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await User.create({ name, surname, email, password: hashedPassword });

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован!' });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      res.status(200).json({ message: 'Успешный вход!' });
    } else {
      res.status(401).json({ message: 'Неверный email или пароль' });
    }
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
