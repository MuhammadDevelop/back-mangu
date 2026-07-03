const express = require('express');
const router = express.Router();
const { sendVerificationCode, verifyCode } = require('../bot');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const usersPath = path.join(__dirname, '..', 'data', 'users.json');
const readUsers = () => {
  try {
    return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  } catch {
    return [];
  }
};
const writeUsers = (data) => fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));

// POST /api/bot/send-code
router.post('/send-code', async (req, res) => {
  try {
    const { phone, name } = req.body;
    if (!phone || !name) {
      return res.status(400).json({ success: false, message: 'Ism va telefon raqam kiritilishi shart.' });
    }

    const users = readUsers();
    if (users.find(u => u.phone === phone)) {
      return res.status(400).json({ success: false, message: "Bu raqam allaqachon ro'yxatdan o'tgan." });
    }

    const code = await sendVerificationCode(phone, name);
    res.json({ success: true, message: 'Tasdiqlash kodi yuborildi!', debug_code: code });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

// POST /api/bot/verify-code
router.post('/verify-code', (req, res) => {
  try {
    const { phone, name, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ success: false, message: 'Raqam va kod kiritilishi shart.' });
    }

    const isValid = verifyCode(phone, code);
    if (!isValid) {
      return res.status(400).json({ success: false, message: "Noto'g'ri yoki muddati o'tgan kod." });
    }

    const users = readUsers();
    const newUser = {
      id: uuidv4(),
      phone,
      name,
      role: 'fan',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    writeUsers(users);

    const token = jwt.sign(
      { id: newUser.id, phone: newUser.phone, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: "Muvaffaqiyatli ro'yxatdan o'tdingiz!",
      data: { token, user: newUser }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server xatosi' });
  }
});

module.exports = router;
