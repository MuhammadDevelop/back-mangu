const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// JWT Secret - .env fayldan oladi, yo'q bo'lsa fallback
const JWT_SECRET = process.env.JWT_SECRET || 'mangu-liga-v2-secret-key-change-in-production';

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token topilmadi. Avtorizatsiya talab qilinadi.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user still exists in DB
    const usersPath = path.join(__dirname, '..', 'data', 'users.json');
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Foydalanuvchi topilmadi.'
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
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token muddati tugagan.' });
    }
    return res.status(401).json({ success: false, message: "Noto'g'ri token." });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Admin huquqi talab qilinadi.' });
  }
};

module.exports = { auth, adminOnly, JWT_SECRET };
