const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== SECURITY & MIDDLEWARE ====================

// Helmet for secure HTTP headers
app.use(helmet());

// Global Rate Limiter to prevent brute-force attacks
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: "Juda ko'p so'rov yuborildi. Iltimos keyinroq urinib ko'ring." }
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { success: false, message: "Ko'p xato urinishlar. 1 soatdan keyin urinib ko'ring." }
});

// CORS - barcha frontenddan ruxsat (Render, Netlify, Vercel, localhost)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://back-mangu.onrender.com',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Origin yo'q bo'lsa (curl, Postman) yoki ro'yxatda bo'lsa - ruxsat
    if (!origin || allowedOrigins.includes(origin) || process.env.FRONTEND_URL === '*') {
      callback(null, true);
    } else {
      callback(null, true); // Hozircha barchasiga ruxsat - deploy qilingach cheklash
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// JSON body parser with 50mb limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// ==================== ENSURE DATA DIRECTORY ====================

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure all data files exist with correct defaults
const dataFiles = {
  'users.json': '[]',
  'sportchilar.json': '[]',
  'matches.json': '[]',
  'videos.json': '[]',
  'news.json': '[]',
  'referees.json': '[]',
  'academy.json': '[]',
  'fans.json': '[]',
  'applications.json': '[]',
  'tickets.json': '[]',
  'bot_users.json': '[]',
  'analytics.json': '{}',
  'settings.json': '{}'
};

Object.entries(dataFiles).forEach(([filename, defaultContent]) => {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent);
  }
});

// ==================== CREATE DEFAULT ADMIN ====================

const createDefaultAdmin = () => {
  const usersPath = path.join(dataDir, 'users.json');
  try {
    const usersRaw = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersRaw);
    const adminExists = users.find(u => u.role === 'admin');
    if (!adminExists) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      const adminUser = {
        id: uuidv4(),
        email: 'admin@manguliga.uz',
        login: 'admin',
        password: hashedPassword,
        name: 'Super Admin',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      users.push(adminUser);
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
      console.log('✅ Default admin yaratildi: admin@manguliga.uz | login: admin | parol: admin123');
    }
  } catch (error) {
    console.error('❌ Admin yaratishda xatolik:', error);
  }
};
createDefaultAdmin();

// ==================== ROUTES ====================

const authRoutes = require('./routes/authRoutes');
const botRoutes = require('./routes/botRoutes');
const sportchiRoutes = require('./routes/sportchiRoutes');
const matchRoutes = require('./routes/matchRoutes');
const videoRoutes = require('./routes/videoRoutes');
const newsRoutes = require('./routes/newsRoutes');
const refereeRoutes = require('./routes/refereeRoutes');
const academyRoutes = require('./routes/academyRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const fanRoutes = require('./routes/fanRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/sportchilar', sportchiRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/referees', refereeRoutes);
app.use('/api/academy', academyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/fans', fanRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/applications', applicationRoutes);

// ==================== HEALTH CHECK & UPTIME MONITOR ====================

// UptimeRobot uchun yengil ping endpoint (auth shart emas)
app.get('/ping', (req, res) => {
  res.status(200).send('OK');
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mangu Liga v2.0 SECURE Backend ishlayapti! 🥊',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// ==================== 404 HANDLER ====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route topilmadi: ${req.method} ${req.originalUrl}`
  });
});

// ==================== ERROR HANDLER ====================

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Server xatosi:', err);
  res.status(500).json({ success: false, message: 'Ichki server xatosi.' });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('🥊 ==========================================');
  console.log('🥊  MANGU LIGA v2.0 SECURE Backend');
  console.log('🥊  Telegram Bot ulangan va Himoyalangan!');
  console.log(`🥊  Port: ${PORT}`);
  console.log('🥊 ==========================================');
});

module.exports = app;
