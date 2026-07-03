const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { auth, adminOnly } = require('../middleware/auth');

const dataPath = path.join(__dirname, '..', 'data', 'academy.json');

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
    cb(null, `academy-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', (req, res) => {
  try {
    const courses = readData();
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

router.post('/', auth, adminOnly, upload.single('image'), (req, res) => {
  try {
    const courses = readData();
    const { title, description, instructor, category, duration, level, isPublished } = req.body;
    const newCourse = {
      id: uuidv4(),
      title: title || '',
      description: description || '',
      instructor: instructor || '',
      category: category || 'online',
      duration: duration || '',
      level: level || '',
      image: req.file ? `/uploads/${req.file.filename}` : '',
      isPublished: isPublished === 'true' || isPublished === true,
      createdAt: new Date().toISOString()
    };
    courses.push(newCourse);
    writeData(courses);
    res.status(201).json({ success: true, data: newCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

router.put('/:id', auth, adminOnly, upload.single('image'), (req, res) => {
  try {
    const courses = readData();
    const index = courses.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Kurs topilmadi.' });
    const existing = courses[index];
    const { title, description, instructor, category, duration, level, isPublished } = req.body;
    courses[index] = {
      ...existing,
      title: title !== undefined ? title : existing.title,
      description: description !== undefined ? description : existing.description,
      instructor: instructor !== undefined ? instructor : existing.instructor,
      category: category !== undefined ? category : existing.category,
      duration: duration !== undefined ? duration : existing.duration,
      level: level !== undefined ? level : existing.level,
      image: req.file ? `/uploads/${req.file.filename}` : existing.image,
      isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : existing.isPublished
    };
    writeData(courses);
    res.json({ success: true, data: courses[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

router.delete('/:id', auth, adminOnly, (req, res) => {
  try {
    let courses = readData();
    const index = courses.findIndex(c => c.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Kurs topilmadi.' });
    const deleted = courses.splice(index, 1)[0];
    writeData(courses);
    res.json({ success: true, data: deleted, message: "Kurs o'chirildi." });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server xatosi.' });
  }
});

module.exports = router;
