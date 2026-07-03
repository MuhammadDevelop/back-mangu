const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { auth, adminOnly } = require('../middleware/auth');

const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');

const readSettings = () => {
  try { return JSON.parse(fs.readFileSync(settingsPath, 'utf8')); }
  catch { return {}; }
};

router.get('/gateways', auth, (req, res) => {
  try {
    const settings = readSettings();
    res.json({
      success: true,
      data: {
        gateways: settings.paymentGateways || {},
        ottPlatforms: settings.ottPlatforms || {}
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

router.post('/process', auth, (req, res) => {
  try {
    const { gateway, amount, currency, description, userId } = req.body;
    if (!gateway || !amount) {
      return res.status(400).json({ success: false, message: 'Gateway va summa kiritilishi shart.' });
    }
    const transaction = {
      id: `txn-${Date.now()}`,
      gateway,
      amount: parseFloat(amount),
      currency: currency || 'UZS',
      description: description || '',
      userId: userId || req.user.id,
      status: 'completed',
      processedAt: new Date().toISOString()
    };
    res.json({ success: true, data: transaction, message: `${gateway} orqali to'lov muvaffaqiyatli amalga oshirildi.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

router.get('/history', auth, (req, res) => {
  try {
    const mockHistory = [
      { id: 'txn-001', gateway: 'payme', amount: 50000, currency: 'UZS', description: 'VIP obuna', status: 'completed', processedAt: '2025-06-20T10:00:00.000Z' },
      { id: 'txn-002', gateway: 'click', amount: 25000, currency: 'UZS', description: 'Jang bileti', status: 'completed', processedAt: '2025-06-18T14:00:00.000Z' },
      { id: 'txn-003', gateway: 'payme', amount: 100000, currency: 'UZS', description: 'Yillik obuna', status: 'completed', processedAt: '2025-06-15T09:00:00.000Z' }
    ];
    res.json({ success: true, data: mockHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

router.put('/gateways', auth, adminOnly, (req, res) => {
  try {
    const settings = readSettings();
    const { paymentGateways } = req.body;
    if (paymentGateways) {
      settings.paymentGateways = { ...settings.paymentGateways, ...paymentGateways };
    }
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    res.json({ success: true, data: settings.paymentGateways });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

module.exports = router;
