const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { auth, JWT_SECRET } = require('../middleware/auth');

const usersPath = path.join(__dirname, '..', 'data', 'users.json');

const readUsers = () => {
  try {
    return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  } catch {
    return [];
  }
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ success: false, message: res.t('invalidData') });
    }

    const users = readUsers();
    const user = users.find(u => u.login === login || u.email === login);

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ success: false, message: res.t('loginFailed') });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: res.t('loginFailed') });
    }

    const token = jwt.sign(
      { id: user.id, login: user.login || user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          login: user.login || user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login xatosi:', error);
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', auth, (req, res) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (error) {
    console.error('Me xatosi:', error);
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

module.exports = router;
