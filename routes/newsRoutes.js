const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { auth, adminOnly } = require('../middleware/auth');

const dataPath = path.join(__dirname, '..', 'data', 'news.json');

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
    cb(null, `news-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', (req, res) => {
  try {
    const news = readData();
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const news = readData();
    const article = news.find(n => n.id === req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Yangilik topilmadi.' });
    res.json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

router.post('/', auth, adminOnly, upload.single('image'), (req, res) => {
  try {
    const news = readData();
    const { title, content, author, category, isPublished } = req.body;
    const newArticle = {
      id: uuidv4(),
      title: title || '',
      content: content || '',
      image: req.file ? `/uploads/${req.file.filename}` : '',
      author: author || '',
      category: category || '',
      isPublished: isPublished === 'true' || isPublished === true,
      createdAt: new Date().toISOString()
    };
    news.push(newArticle);
    writeData(news);
    res.status(201).json({ success: true, data: newArticle });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

router.put('/:id', auth, adminOnly, upload.single('image'), (req, res) => {
  try {
    const news = readData();
    const index = news.findIndex(n => n.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Yangilik topilmadi.' });
    const existing = news[index];
    const { title, content, author, category, isPublished } = req.body;
    news[index] = {
      ...existing,
      title: title !== undefined ? title : existing.title,
      content: content !== undefined ? content : existing.content,
      image: req.file ? `/uploads/${req.file.filename}` : existing.image,
      author: author !== undefined ? author : existing.author,
      category: category !== undefined ? category : existing.category,
      isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : existing.isPublished
    };
    writeData(news);
    res.json({ success: true, data: news[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

router.delete('/:id', auth, adminOnly, (req, res) => {
  try {
    let news = readData();
    const index = news.findIndex(n => n.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Yangilik topilmadi.' });
    const deleted = news.splice(index, 1)[0];
    writeData(news);
    res.json({ success: true, data: deleted, message: "Yangilik o'chirildi." });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

module.exports = router;
