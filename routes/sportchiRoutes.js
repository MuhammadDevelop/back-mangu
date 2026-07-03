const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { auth, adminOnly } = require('../middleware/auth');

const dataPath = path.join(__dirname, '..', 'data', 'sportchilar.json');

const readData = () => {
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch {
    return [];
  }
};
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `sportchi-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/sportchilar
router.get('/', (req, res) => {
  try {
    const sportchilar = readData();
    res.json({ success: true, data: sportchilar });
  } catch (error) {
    console.error('Sportchilar olish xatosi:', error);
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

// GET /api/sportchilar/:id
router.get('/:id', (req, res) => {
  try {
    const sportchilar = readData();
    const fighter = sportchilar.find(s => s.id === req.params.id);
    if (!fighter) {
      return res.status(404).json({ success: false, message: 'Sportchi topilmadi.' });
    }
    res.json({ success: true, data: fighter });
  } catch (error) {
    console.error('Sportchi olish xatosi:', error);
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

// POST /api/sportchilar (admin)
router.post('/', auth, adminOnly, upload.single('image'), (req, res) => {
  try {
    const sportchilar = readData();
    const { name, nickname, age, weight, height, wins, losses, draws, rank, category, bio, isActive } = req.body;

    const newFighter = {
      id: uuidv4(),
      name: name || '',
      nickname: nickname || '',
      age: parseInt(age) || 0,
      weight: parseFloat(weight) || 0,
      height: parseFloat(height) || 0,
      wins: parseInt(wins) || 0,
      losses: parseInt(losses) || 0,
      draws: parseInt(draws) || 0,
      rank: parseInt(rank) || 0,
      category: category || '',
      image: req.file ? `/uploads/${req.file.filename}` : '',
      bio: bio || '',
      isActive: isActive === 'true' || isActive === true,
      createdAt: new Date().toISOString()
    };

    sportchilar.push(newFighter);
    writeData(sportchilar);
    res.status(201).json({ success: true, data: newFighter });
  } catch (error) {
    console.error('Sportchi yaratish xatosi:', error);
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

// PUT /api/sportchilar/:id (admin)
router.put('/:id', auth, adminOnly, upload.single('image'), (req, res) => {
  try {
    const sportchilar = readData();
    const index = sportchilar.findIndex(s => s.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Sportchi topilmadi.' });
    }

    const existing = sportchilar[index];
    const { name, nickname, age, weight, height, wins, losses, draws, rank, category, bio, isActive } = req.body;

    sportchilar[index] = {
      ...existing,
      name: name !== undefined ? name : existing.name,
      nickname: nickname !== undefined ? nickname : existing.nickname,
      age: age !== undefined ? parseInt(age) : existing.age,
      weight: weight !== undefined ? parseFloat(weight) : existing.weight,
      height: height !== undefined ? parseFloat(height) : existing.height,
      wins: wins !== undefined ? parseInt(wins) : existing.wins,
      losses: losses !== undefined ? parseInt(losses) : existing.losses,
      draws: draws !== undefined ? parseInt(draws) : existing.draws,
      rank: rank !== undefined ? parseInt(rank) : existing.rank,
      category: category !== undefined ? category : existing.category,
      image: req.file ? `/uploads/${req.file.filename}` : existing.image,
      bio: bio !== undefined ? bio : existing.bio,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : existing.isActive
    };

    writeData(sportchilar);
    res.json({ success: true, data: sportchilar[index] });
  } catch (error) {
    console.error('Sportchi yangilash xatosi:', error);
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

// DELETE /api/sportchilar/:id (admin)
router.delete('/:id', auth, adminOnly, (req, res) => {
  try {
    let sportchilar = readData();
    const index = sportchilar.findIndex(s => s.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Sportchi topilmadi.' });
    }

    const deleted = sportchilar.splice(index, 1)[0];
    writeData(sportchilar);
    res.json({ success: true, data: deleted, message: "Sportchi o'chirildi." });
  } catch (error) {
    console.error("Sportchi o'chirish xatosi:", error);
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

module.exports = router;
