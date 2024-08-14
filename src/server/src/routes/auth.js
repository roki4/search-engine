const express = require('express');
const router = express.Router();

const users = [];

router.post('/register', (req, res) => {
  const { name, surname, email, password } = req.body;
  const user = { name, surname, email, password };
  users.push(user);
  res.status(201).json({ message: 'Пользователь успешно зарегистрирован!' });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.status(200).json({ message: 'Успешный вход!' });
  } else {
    res.status(401).json({ message: 'Неверный email или пароль' });
  }
});

module.exports = router;
