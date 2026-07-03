const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { auth, adminOnly } = require('../middleware/auth');

const dataPath = path.join(__dirname, '..', 'data', 'matches.json');

const readData = () => {
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch {
    return [];
  }
};
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// GET /api/matches
router.get('/', (req, res) => {
  try {
    const matches = readData();
    const fightersPath = path.join(__dirname, '..', 'data', 'sportchilar.json');
    let fighters = [];
    if (fs.existsSync(fightersPath)) {
      fighters = JSON.parse(fs.readFileSync(fightersPath, 'utf8'));
    }

    const populatedMatches = matches.map(match => {
      const fighter1 = fighters.find(f => f.id === match.fighter1Id) || null;
      const fighter2 = fighters.find(f => f.id === match.fighter2Id) || null;
      return { ...match, fighter1, fighter2 };
    });

    res.json({ success: true, data: populatedMatches });
  } catch (error) {
    console.error('Matchlar olish xatosi:', error);
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

// GET /api/matches/:id
router.get('/:id', (req, res) => {
  try {
    const matches = readData();
    const match = matches.find(m => m.id === req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, message: "O'yin topilmadi." });
    }

    const fightersPath = path.join(__dirname, '..', 'data', 'sportchilar.json');
    let fighters = [];
    if (fs.existsSync(fightersPath)) {
      fighters = JSON.parse(fs.readFileSync(fightersPath, 'utf8'));
    }
    match.fighter1 = fighters.find(f => f.id === match.fighter1Id) || null;
    match.fighter2 = fighters.find(f => f.id === match.fighter2Id) || null;

    res.json({ success: true, data: match });
  } catch (error) {
    console.error('Match olish xatosi:', error);
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST /api/matches (admin)
router.post('/', auth, adminOnly, upload.single('image'), (req, res) => {
  try {
    const matches = readData();
    const { title, fighter1Id, fighter2Id, fighter1Name, fighter2Name, date, venue, category, status, result, round, eventName } = req.body;

    const newMatch = {
      id: uuidv4(),
      title: title || '',
      fighter1Id: fighter1Id || '',
      fighter2Id: fighter2Id || '',
      fighter1Name: fighter1Name || '',
      fighter2Name: fighter2Name || '',
      date: date || new Date().toISOString(),
      venue: venue || '',
      category: category || '',
      status: status || 'upcoming',
      result: result || null,
      round: parseInt(round) || 5,
      eventName: eventName || '',
      image: req.file ? `/uploads/${req.file.filename}` : '',
      createdAt: new Date().toISOString()
    };

    matches.push(newMatch);
    writeData(matches);
    res.status(201).json({ success: true, message: "O'yin yaratildi.", data: newMatch });
  } catch (error) {
    console.error('Match yaratish xatosi:', error);
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

// PUT /api/matches/:id (admin)
router.put('/:id', auth, adminOnly, upload.single('image'), (req, res) => {
  try {
    const matches = readData();
    const index = matches.findIndex(m => m.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "O'yin topilmadi." });
    }

    const existing = matches[index];
    const { title, fighter1Id, fighter2Id, fighter1Name, fighter2Name, date, venue, category, status, result, round, eventName, removeImage } = req.body;

    let newImage = existing.image;
    if (removeImage === 'true') newImage = '';
    else if (req.file) newImage = `/uploads/${req.file.filename}`;

    matches[index] = {
      ...existing,
      title: title !== undefined ? title : existing.title,
      fighter1Id: fighter1Id !== undefined ? fighter1Id : existing.fighter1Id,
      fighter2Id: fighter2Id !== undefined ? fighter2Id : existing.fighter2Id,
      fighter1Name: fighter1Name !== undefined ? fighter1Name : existing.fighter1Name,
      fighter2Name: fighter2Name !== undefined ? fighter2Name : existing.fighter2Name,
      date: date !== undefined ? date : existing.date,
      venue: venue !== undefined ? venue : existing.venue,
      category: category !== undefined ? category : existing.category,
      status: status !== undefined ? status : existing.status,
      result: result !== undefined ? result : existing.result,
      round: round !== undefined ? parseInt(round) : existing.round,
      eventName: eventName !== undefined ? eventName : existing.eventName,
      image: newImage
    };

    writeData(matches);
    res.json({ success: true, data: matches[index] });
  } catch (error) {
    console.error('Match yangilash xatosi:', error);
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

// DELETE /api/matches/:id (admin)
router.delete('/:id', auth, adminOnly, (req, res) => {
  try {
    let matches = readData();
    const index = matches.findIndex(m => m.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: "O'yin topilmadi." });
    }

    const deleted = matches.splice(index, 1)[0];
    writeData(matches);
    res.json({ success: true, data: deleted, message: "O'yin o'chirildi." });
  } catch (error) {
    console.error("Match o'chirish xatosi:", error);
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

module.exports = router;
