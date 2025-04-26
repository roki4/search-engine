const express = require('express');
const authService = require('../services/authService');
const profileService = require('../services/profileService');
const validate = require('../middleware/validate');
const { changePasswordSchema } = require('../validators/profileValidator');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

router.post('/change-password', isAuthenticated, validate(changePasswordSchema), async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    await authService.changePassword(req.user.id, oldPassword, newPassword);
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    if (error.message === 'INVALID_PASSWORD') {
      return res.status(400).json({ message: 'Invalid current password' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/search-history', isAuthenticated, async (req, res) => {
  try {
    const history = await profileService.getSearchHistory(req.user.id);
    res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;