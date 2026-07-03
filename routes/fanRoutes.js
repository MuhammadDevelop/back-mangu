const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { auth, adminOnly } = require('../middleware/auth');

const dataPath = path.join(__dirname, '..', 'data', 'fans.json');

const readData = () => {
  try { return JSON.parse(fs.readFileSync(dataPath, 'utf8')); }
  catch { return []; }
};
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// GET /api/fans
router.get('/', (req, res) => {
  try {
    const fans = readData();
    res.json({ success: true, data: fans });
  } catch (error) {
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

// POST /api/fans - Register fan
router.post('/', (req, res) => {
  try {
    const fans = readData();
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Ism va email kiritilishi shart.' });
    }

    if (fans.find(f => f.email === email)) {
      return res.status(400).json({ success: false, message: "Bu email allaqachon ro'yxatdan o'tgan." });
    }

    const newFan = {
      id: uuidv4(),
      name,
      email,
      coins: 100,
      vipLevel: 'Bronze',
      badges: ["Birinchi qo'shilish"],
      joinedAt: new Date().toISOString()
    };

    fans.push(newFan);
    writeData(fans);
    res.status(201).json({ success: true, data: newFan, message: 'Xush kelibsiz! 100 coin bonus berildi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

// PUT /api/fans/:id
router.put('/:id', auth, (req, res) => {
  try {
    const fans = readData();
    const index = fans.findIndex(f => f.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: res.t('fanNotFound') });
    }

    const existing = fans[index];
    const { name, email, coins, vipLevel, badges } = req.body;

    fans[index] = {
      ...existing,
      name: name !== undefined ? name : existing.name,
      email: email !== undefined ? email : existing.email,
      coins: coins !== undefined ? parseInt(coins) : existing.coins,
      vipLevel: vipLevel !== undefined ? vipLevel : existing.vipLevel,
      badges: badges !== undefined ? badges : existing.badges
    };

    writeData(fans);
    res.json({ success: true, data: fans[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

// DELETE /api/fans/:id (admin)
router.delete('/:id', auth, adminOnly, (req, res) => {
  try {
    let fans = readData();
    const index = fans.findIndex(f => f.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: res.t('fanNotFound') });
    }

    const deleted = fans.splice(index, 1)[0];
    writeData(fans);
    res.json({ success: true, data: deleted, message: res.t('fanDeleted') });
  } catch (error) {
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

// POST /api/fans/:id/coins
router.post('/:id/coins', auth, (req, res) => {
  try {
    const fans = readData();
    const index = fans.findIndex(f => f.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: res.t('fanNotFound') });
    }

    const { amount, reason } = req.body;
    const coinsToAdd = parseInt(amount) || 0;
    fans[index].coins = (fans[index].coins || 0) + coinsToAdd;

    const totalCoins = fans[index].coins;
    if (totalCoins >= 1000) fans[index].vipLevel = 'Platinum';
    else if (totalCoins >= 500) fans[index].vipLevel = 'Gold';
    else if (totalCoins >= 200) fans[index].vipLevel = 'Silver';
    else fans[index].vipLevel = 'Bronze';

    writeData(fans);
    res.json({
      success: true,
      data: fans[index],
      message: `${coinsToAdd} coin qo'shildi. ${reason || ''}`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

module.exports = router;
