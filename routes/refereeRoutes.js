const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { auth, adminOnly } = require('../middleware/auth');

const dataPath = path.join(__dirname, '..', 'data', 'referees.json');

const readData = () => {
  try { return JSON.parse(fs.readFileSync(dataPath, 'utf8')); }
  catch { return []; }
};
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

router.get('/', (req, res) => {
  try {
    const referees = readData();
    res.json({ success: true, data: referees });
  } catch (error) {
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

router.post('/', auth, adminOnly, (req, res) => {
  try {
    const referees = readData();
    const { name, licenseNumber, licenseType, experience, rating, matchesOfficiated, warnings, disqualifications, isActive } = req.body;
    const newReferee = {
      id: uuidv4(),
      name: name || '',
      licenseNumber: licenseNumber || '',
      licenseType: licenseType || 'B',
      experience: parseInt(experience) || 0,
      rating: parseFloat(rating) || 0,
      matchesOfficiated: parseInt(matchesOfficiated) || 0,
      warnings: parseInt(warnings) || 0,
      disqualifications: parseInt(disqualifications) || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString()
    };
    referees.push(newReferee);
    writeData(referees);
    res.status(201).json({ success: true, data: newReferee });
  } catch (error) {
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

router.put('/:id', auth, adminOnly, (req, res) => {
  try {
    const referees = readData();
    const index = referees.findIndex(r => r.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: res.t('refereeNotFound') });
    const existing = referees[index];
    const { name, licenseNumber, licenseType, experience, rating, matchesOfficiated, warnings, disqualifications, isActive } = req.body;
    referees[index] = {
      ...existing,
      name: name !== undefined ? name : existing.name,
      licenseNumber: licenseNumber !== undefined ? licenseNumber : existing.licenseNumber,
      licenseType: licenseType !== undefined ? licenseType : existing.licenseType,
      experience: experience !== undefined ? parseInt(experience) : existing.experience,
      rating: rating !== undefined ? parseFloat(rating) : existing.rating,
      matchesOfficiated: matchesOfficiated !== undefined ? parseInt(matchesOfficiated) : existing.matchesOfficiated,
      warnings: warnings !== undefined ? parseInt(warnings) : existing.warnings,
      disqualifications: disqualifications !== undefined ? parseInt(disqualifications) : existing.disqualifications,
      isActive: isActive !== undefined ? isActive : existing.isActive
    };
    writeData(referees);
    res.json({ success: true, data: referees[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

router.delete('/:id', auth, adminOnly, (req, res) => {
  try {
    let referees = readData();
    const index = referees.findIndex(r => r.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: res.t('refereeNotFound') });
    const deleted = referees.splice(index, 1)[0];
    writeData(referees);
    res.json({ success: true, data: deleted, message: res.t('refereeDeleted') });
  } catch (error) {
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

module.exports = router;
