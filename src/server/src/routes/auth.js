const express = require('express');
const authService = require('../services/authService');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, logoutSchema } = require('../validators/authValidator');

const router = express.Router();

router.post('/register', validate(registerSchema), async (req, res) => {
  const { name, surname, email, password } = req.body;
  try {
    await authService.register({ name, surname, email, password });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    if (error.message === 'EMAIL_EXISTS') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authService.login({ email, password });
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', validate(logoutSchema), async (req, res) => {
  try {
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;