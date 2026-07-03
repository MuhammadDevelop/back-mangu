const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const applicationsFile = path.join(__dirname, '..', 'data', 'applications.json');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'video_' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const getApplications = () => {
  try {
    if (!fs.existsSync(applicationsFile)) fs.writeFileSync(applicationsFile, '[]');
    return JSON.parse(fs.readFileSync(applicationsFile, 'utf8'));
  } catch {
    return [];
  }
};

const saveApplications = (apps) => {
  fs.writeFileSync(applicationsFile, JSON.stringify(apps, null, 2));
};

// GET /api/applications
router.get('/', (req, res) => {
  try {
    const apps = getApplications();
    apps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: apps });
  } catch (error) {
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

// POST /api/applications - Submit application
router.post('/', upload.single('videoUrl'), (req, res) => {
  try {
    const { name, phone, age, weight, height, experience } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, message: res.t('applicationRequired') });
    }

    const apps = getApplications();
    const newApp = {
      _id: Date.now().toString(),
      name,
      phone,
      age: age || '',
      weight: weight || '',
      height: height || '',
      experience: experience || '',
      videoUrl: req.file ? `/uploads/${req.file.filename}` : '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    apps.push(newApp);
    saveApplications(apps);
    res.json({ success: true, message: res.t('applicationSent') });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

// PUT /api/applications/:id/status
router.put('/:id/status', (req, res) => {
  try {
    const apps = getApplications();
    const { status } = req.body;
    const index = apps.findIndex(a => a._id === req.params.id);

    if (index === -1) return res.status(404).json({ success: false, message: res.t('applicationNotFound') });

    apps[index].status = status;
    saveApplications(apps);
    res.json({ success: true, message: res.t('ticketStatusChanged') });
  } catch (error) {
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

// DELETE /api/applications/:id
router.delete('/:id', (req, res) => {
  try {
    let apps = getApplications();
    apps = apps.filter(a => a._id !== req.params.id);
    saveApplications(apps);
    res.json({ success: true, message: res.t('applicationDeleted') });
  } catch (error) {
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

module.exports = router;
