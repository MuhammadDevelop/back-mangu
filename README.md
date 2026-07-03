# Mangu Liga Backend API 🥊

O'zbekiston sport platformasi uchun Node.js/Express backend API.

## 🚀 Ishga tushirish

### 1. Talablar
- Node.js v18+
- npm

### 2. O'rnatish

```bash
npm install
```

### 3. Environment variables sozlash

`.env.example` faylini `.env` nomi bilan nusxalang:
```bash
copy .env.example .env
```

`.env` faylini to'ldiring:
```
PORT=5000
JWT_SECRET=your-very-secret-key-here
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
FRONTEND_URL=http://localhost:5173
```

### 4. Ishga tushirish

```bash
# Development (nodemon bilan)
npm run dev

# Production
npm start
```

## 🔑 Default Admin

Server birinchi marta ishga tushganda avtomatik admin yaratiladi:
- **Email:** `admin@manguliga.uz`  
- **Login:** `admin`  
- **Parol:** `admin123`

> ⚠️ Birinchi kirishdan keyin parolni o'zgartiring!

## 📡 API Endpoints

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/auth/me` | Joriy foydalanuvchi |
| GET | `/api/sportchilar` | Sportchilar ro'yxati |
| GET | `/api/matches` | Matchlar ro'yxati |
| GET | `/api/videos` | Videolar ro'yxati |
| GET | `/api/news` | Yangiliklar ro'yxati |
| GET | `/api/referees` | Hakamlar ro'yxati |
| GET | `/api/analytics/dashboard` | Dashboard statistikasi |
| POST | `/api/tickets/book` | Chipta bron qilish |
| POST | `/api/applications` | Ariza yuborish |
| GET | `/api/health` | Server holati |

## 📁 Papka strukturasi

```
backend/
├── data/           # JSON ma'lumotlar bazasi
├── middleware/     # Auth middleware
├── routes/         # API route'lar
├── uploads/        # Yuklangan fayllar (gitignore)
├── bot.js          # Telegram bot
├── server.js       # Asosiy server
└── package.json
```

## 🔒 Xavfsizlik

- JWT token autentifikatsiya
- bcryptjs parol hashing
- Helmet HTTP headers
- Rate limiting (brute-force himoyasi)
- CORS sozlash
