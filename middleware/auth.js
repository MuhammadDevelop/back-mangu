const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'mangu-liga-v2-secret-key-change-in-production';

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: res.t ? res.t('tokenRequired') : 'Token kiritilishi shart.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const usersPath = path.join(__dirname, '..', 'data', 'users.json');
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: res.t ? res.t('unauthorized') : 'Ruxsat yo\'q.'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      login: user.login,
      role: user.role,
      name: user.name
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: res.t ? res.t('tokenInvalid') : 'Token yaroqsiz yoki muddati o\'tgan.'
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: res.t ? res.t('adminOnly') : 'Faqat adminlar uchun.'
    });
  }
};

module.exports = { auth, adminOnly, JWT_SECRET };
