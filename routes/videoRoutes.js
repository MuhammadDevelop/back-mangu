const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { auth, adminOnly } = require('../middleware/auth');

const dataPath = path.join(__dirname, '..', 'data', 'videos.json');

const readData = () => {
  try { return JSON.parse(fs.readFileSync(dataPath, 'utf8')); }
  catch { return []; }
};
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

router.get('/', (req, res) => {
  try {
    let videos = readData();
    res.json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const videos = readData();
    const video = videos.find(v => v.id === req.params.id);
    if (!video) return res.status(404).json({ success: false, message: 'Video topilmadi.' });
    res.json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

router.post('/', auth, adminOnly, upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'video', maxCount: 1 }]), (req, res) => {
  try {
    const videos = readData();
    const { title, description, url, matchId, category, duration, views, published } = req.body;
    const newVideo = {
      id: uuidv4(),
      title: title || '',
      description: description || '',
      url: req.files && req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : (url || ''),
      matchId: matchId || null,
      thumbnail: req.files && req.files['thumbnail'] ? `/uploads/${req.files['thumbnail'][0].filename}` : '',
      category: category || 'Boshqa',
      duration: duration || '00:00',
      views: parseInt(views) || 0,
      published: published === 'true' || published === true,
      createdAt: new Date().toISOString()
    };
    videos.push(newVideo);
    writeData(videos);
    res.status(201).json({ success: true, data: newVideo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

router.put('/:id', auth, adminOnly, upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'video', maxCount: 1 }]), (req, res) => {
  try {
    const videos = readData();
    const index = videos.findIndex(v => v.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Video topilmadi.' });
    const existing = videos[index];
    const { title, description, url, matchId, category, duration, views, published, removeThumbnail, removeVideo } = req.body;
    let newThumbnail = existing.thumbnail;
    if (removeThumbnail === 'true') newThumbnail = '';
    else if (req.files && req.files['thumbnail']) newThumbnail = `/uploads/${req.files['thumbnail'][0].filename}`;
    let newUrl = existing.url;
    if (removeVideo === 'true') newUrl = '';
    else if (req.files && req.files['video']) newUrl = `/uploads/${req.files['video'][0].filename}`;
    else if (url) newUrl = url;
    videos[index] = {
      ...existing,
      title: title !== undefined ? title : existing.title,
      description: description !== undefined ? description : existing.description,
      url: newUrl,
      matchId: matchId !== undefined ? matchId : existing.matchId,
      thumbnail: newThumbnail,
      category: category !== undefined ? category : existing.category,
      duration: duration !== undefined ? duration : existing.duration,
      views: views !== undefined ? parseInt(views) : existing.views,
      published: published !== undefined ? (published === 'true' || published === true) : existing.published
    };
    writeData(videos);
    res.json({ success: true, data: videos[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

router.delete('/:id', auth, adminOnly, (req, res) => {
  try {
    let videos = readData();
    const index = videos.findIndex(v => v.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Video topilmadi.' });
    const deleted = videos.splice(index, 1)[0];
    writeData(videos);
    res.json({ success: true, data: deleted, message: "Video o'chirildi." });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

module.exports = router;
