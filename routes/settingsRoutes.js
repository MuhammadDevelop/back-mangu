const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { auth, adminOnly } = require('../middleware/auth');

const dataPath = path.join(__dirname, '..', 'data', 'settings.json');

const readData = () => {
  try { return JSON.parse(fs.readFileSync(dataPath, 'utf8')); }
  catch { return {}; }
};
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// GET /api/settings
router.get('/', (req, res) => {
  try {
    const settings = readData();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

// PUT /api/settings (admin)
router.put('/', auth, adminOnly, (req, res) => {
  try {
    const currentSettings = readData();
    const { siteName, siteDescription, logo, primaryColor, socialLinks, paymentGateways, ottPlatforms } = req.body;

    const updatedSettings = {
      siteName: siteName !== undefined ? siteName : currentSettings.siteName,
      siteDescription: siteDescription !== undefined ? siteDescription : currentSettings.siteDescription,
      logo: logo !== undefined ? logo : currentSettings.logo,
      primaryColor: primaryColor !== undefined ? primaryColor : currentSettings.primaryColor,
      socialLinks: socialLinks !== undefined ? { ...currentSettings.socialLinks, ...socialLinks } : currentSettings.socialLinks,
      paymentGateways: paymentGateways !== undefined ? { ...currentSettings.paymentGateways, ...paymentGateways } : currentSettings.paymentGateways,
      ottPlatforms: ottPlatforms !== undefined ? { ...currentSettings.ottPlatforms, ...ottPlatforms } : currentSettings.ottPlatforms
    };

    writeData(updatedSettings);
    res.json({ success: true, data: updatedSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

module.exports = router;
