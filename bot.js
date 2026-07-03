require('dotenv').config();
const { Telegraf } = require('telegraf');

const fs = require('fs');
const path = require('path');

// Bot token - .env fayldan oladi
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.warn('⚠️  TELEGRAM_BOT_TOKEN .env faylda yo\'q. Bot ishlamaydi.');
}

let bot = null;
let adminChats = new Set();
const usersFilePath = path.join(__dirname, 'data', 'bot_users.json');

// OTP storage
let pendingOTPs = {}; // { phone: { code, expiry } }
let adminOTP = null;
let adminOTPExpiry = null;

const loadAdminChats = () => {
  try {
    if (fs.existsSync(usersFilePath)) {
      const data = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
      adminChats = new Set(data);
    }
  } catch (err) {
    console.log('bot_users.json yuklashda xato:', err.message);
  }
};

const saveAdminChats = () => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(Array.from(adminChats), null, 2), 'utf8');
  } catch (err) {
    console.log('bot_users.json saqlashda xato:', err.message);
  }
};

loadAdminChats();

// Initialize bot only if token is provided
if (BOT_TOKEN) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  bot = new Telegraf(BOT_TOKEN);

  bot.start((ctx) => {
    adminChats.add(ctx.chat.id);
    saveAdminChats();
    ctx.reply(
      '🥊 Assalomu alaykum! Mangu Liga botiga xush kelibsiz!\n\n' +
      'Admin uchun: Saytga kirayotganda tasdiqlash kodlari shu yerga keladi.\n' +
      'Foydalanuvchilar uchun: /register buyrug\'ini kiriting.'
    );
  });

  // User sends phone number for verification
  bot.on('contact', (ctx) => {
    const phone = ctx.message.contact.phone_number.replace(/\D/g, '');
    const chatId = ctx.chat.id;

    if (pendingOTPs[phone]) {
      const code = pendingOTPs[phone].code;
      ctx.reply(`✅ Sizning tasdiqlash kodingiz: *${code}*\n\nKod 5 daqiqa davomida amal qiladi.`, { parse_mode: 'Markdown' });
    } else {
      ctx.reply('❌ Bu raqam uchun tasdiqlash kodi topilmadi. Avval saytda ro\'yxatdan o\'ting.');
    }
  });

  bot.launch().catch(err => console.error('❌ Telegram bot launch error:', err));

  process.once('SIGINT', () => bot && bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot && bot.stop('SIGTERM'));
}

// ==================== ADMIN OTP ====================

const sendAdminOTP = async () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  adminOTP = code;
  adminOTPExpiry = Date.now() + 5 * 60 * 1000; // 5 mins

  console.log(`[ADMIN OTP] Generated: ${code}`);

  if (!bot) {
    console.log('[ADMIN OTP] Bot ishlamayapti. TELEGRAM_BOT_TOKEN .env faylda yo\'q.');
    return true;
  }

  if (adminChats.size === 0) {
    console.log('[ADMIN OTP] Diqqat: Hech qanday admin Telegram botga kirmagan. /start bosish kerak.');
  }

  for (const chatId of adminChats) {
    try {
      await bot.telegram.sendMessage(
        chatId,
        `🔐 Mangu Liga Admin Paneliga kirish kodi: *${code}*\n\nKod 5 daqiqa davomida amal qiladi.\nAgar buni siz so'ramagan bo'lsangiz, e'tibor bermang.`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      console.error('Telegram xabar yuborishda xato:', chatId, err.message);
    }
  }

  return true;
};

const verifyAdminOTP = (code) => {
  if (adminOTP && adminOTP === code && Date.now() < adminOTPExpiry) {
    adminOTP = null; // Bir martalik - consume
    adminOTPExpiry = null;
    return true;
  }
  return false;
};

// ==================== USER VERIFICATION ====================

const sendVerificationCode = async (phone, name) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const cleanPhone = phone.replace(/\D/g, '');

  pendingOTPs[cleanPhone] = {
    code,
    expiry: Date.now() + 5 * 60 * 1000,
    name
  };

  // Clean up old OTPs after expiry
  setTimeout(() => {
    delete pendingOTPs[cleanPhone];
  }, 5 * 60 * 1000);

  console.log(`[USER OTP] Phone: ${cleanPhone}, Code: ${code}`);
  return code; // Return for debug; remove in production
};

const verifyCode = (phone, code) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const pending = pendingOTPs[cleanPhone];

  if (pending && pending.code === code && Date.now() < pending.expiry) {
    delete pendingOTPs[cleanPhone];
    return true;
  }
  return false;
};

module.exports = {
  bot,
  sendAdminOTP,
  verifyAdminOTP,
  sendVerificationCode,
  verifyCode
};
