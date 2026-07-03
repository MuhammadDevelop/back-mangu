// Til middleware - har bir so'rovdan tilni o'qib, res.t() funksiyasini qo'shadi

const messages = {
  uz: {
    // Umumiy
    serverError: 'Server xatosi.',
    notFound: 'Topilmadi.',
    unauthorized: 'Ruxsat yo\'q.',
    forbidden: 'Taqiqlangan.',
    invalidData: 'Noto\'g\'ri ma\'lumot.',

    // Auth
    loginSuccess: 'Muvaffaqiyatli kirdingiz!',
    loginFailed: 'Login yoki parol noto\'g\'ri.',
    logoutSuccess: 'Tizimdan chiqdingiz.',
    tokenRequired: 'Token kiritilishi shart.',
    tokenInvalid: 'Token yaroqsiz yoki muddati o\'tgan.',
    adminOnly: 'Faqat adminlar uchun.',

    // Sportchi
    fighterNotFound: 'Sportchi topilmadi.',
    fighterCreated: 'Sportchi yaratildi.',
    fighterUpdated: 'Sportchi yangilandi.',
    fighterDeleted: 'Sportchi o\'chirildi.',

    // Match
    matchNotFound: 'O\'yin topilmadi.',
    matchCreated: 'O\'yin yaratildi.',
    matchUpdated: 'O\'yin yangilandi.',
    matchDeleted: 'O\'yin o\'chirildi.',

    // Video
    videoNotFound: 'Video topilmadi.',
    videoCreated: 'Video yaratildi.',
    videoUpdated: 'Video yangilandi.',
    videoDeleted: 'Video o\'chirildi.',

    // Yangilik
    newsNotFound: 'Yangilik topilmadi.',
    newsCreated: 'Yangilik yaratildi.',
    newsUpdated: 'Yangilik yangilandi.',
    newsDeleted: 'Yangilik o\'chirildi.',

    // Hakam
    refereeNotFound: 'Hakam topilmadi.',
    refereeCreated: 'Hakam yaratildi.',
    refereeUpdated: 'Hakam yangilandi.',
    refereeDeleted: 'Hakam o\'chirildi.',

    // Chipta
    ticketBooked: 'Chipta so\'rovi qabul qilindi. Admin tasdiqlashini kuting!',
    ticketNotFound: 'Chipta topilmadi.',
    ticketDeleted: 'Chipta o\'chirildi.',
    ticketStatusChanged: 'Holat o\'zgartirildi.',
    ticketRequired: 'Barcha maydonlarni to\'ldiring.',

    // Ariza
    applicationSent: 'Arizangiz muvaffaqiyatli yuborildi. Tez orada siz bilan bog\'lanamiz!',
    applicationNotFound: 'Ariza topilmadi.',
    applicationDeleted: 'Ariza o\'chirildi.',
    applicationRequired: 'Ism va telefon raqam kiritish majburiy!',

    // Fan
    fanExists: 'Bu email allaqachon ro\'yxatdan o\'tgan.',
    fanRequired: 'Ism va email kiritilishi shart.',
    fanCreated: 'Xush kelibsiz! 100 coin bonus berildi.',
    fanNotFound: 'Fan topilmadi.',
    fanDeleted: 'Fan o\'chirildi.',

    // Bot
    botRequired: 'Ism va telefon raqam kiritilishi shart.',
    botPhoneExists: 'Bu raqam allaqachon ro\'yxatdan o\'tgan.',
    botCodeSent: 'Tasdiqlash kodi yuborildi!',
    botCodeInvalid: 'Noto\'g\'ri yoki muddati o\'tgan kod.',
    botRegistered: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!',

    // Kurs
    courseNotFound: 'Kurs topilmadi.',
    courseCreated: 'Kurs yaratildi.',
    courseUpdated: 'Kurs yangilandi.',
    courseDeleted: 'Kurs o\'chirildi.',
  },

  ru: {
    serverError: 'Ошибка сервера.',
    notFound: 'Не найдено.',
    unauthorized: 'Нет доступа.',
    forbidden: 'Запрещено.',
    invalidData: 'Неверные данные.',

    loginSuccess: 'Вы успешно вошли!',
    loginFailed: 'Неверный логин или пароль.',
    logoutSuccess: 'Вы вышли из системы.',
    tokenRequired: 'Токен обязателен.',
    tokenInvalid: 'Токен недействителен или истёк.',
    adminOnly: 'Только для администраторов.',

    fighterNotFound: 'Боец не найден.',
    fighterCreated: 'Боец создан.',
    fighterUpdated: 'Боец обновлён.',
    fighterDeleted: 'Боец удалён.',

    matchNotFound: 'Матч не найден.',
    matchCreated: 'Матч создан.',
    matchUpdated: 'Матч обновлён.',
    matchDeleted: 'Матч удалён.',

    videoNotFound: 'Видео не найдено.',
    videoCreated: 'Видео создано.',
    videoUpdated: 'Видео обновлено.',
    videoDeleted: 'Видео удалено.',

    newsNotFound: 'Новость не найдена.',
    newsCreated: 'Новость создана.',
    newsUpdated: 'Новость обновлена.',
    newsDeleted: 'Новость удалена.',

    refereeNotFound: 'Судья не найден.',
    refereeCreated: 'Судья создан.',
    refereeUpdated: 'Судья обновлён.',
    refereeDeleted: 'Судья удалён.',

    ticketBooked: 'Заявка на билет принята. Ожидайте подтверждения администратора!',
    ticketNotFound: 'Билет не найден.',
    ticketDeleted: 'Билет удалён.',
    ticketStatusChanged: 'Статус изменён.',
    ticketRequired: 'Заполните все поля.',

    applicationSent: 'Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время!',
    applicationNotFound: 'Заявка не найдена.',
    applicationDeleted: 'Заявка удалена.',
    applicationRequired: 'Имя и номер телефона обязательны!',

    fanExists: 'Этот email уже зарегистрирован.',
    fanRequired: 'Имя и email обязательны.',
    fanCreated: 'Добро пожаловать! Начислено 100 монет.',
    fanNotFound: 'Фанат не найден.',
    fanDeleted: 'Фанат удалён.',

    botRequired: 'Имя и номер телефона обязательны.',
    botPhoneExists: 'Этот номер уже зарегистрирован.',
    botCodeSent: 'Код подтверждения отправлен!',
    botCodeInvalid: 'Неверный или просроченный код.',
    botRegistered: 'Вы успешно зарегистрированы!',

    courseNotFound: 'Курс не найден.',
    courseCreated: 'Курс создан.',
    courseUpdated: 'Курс обновлён.',
    courseDeleted: 'Курс удалён.',
  },

  en: {
    serverError: 'Server error.',
    notFound: 'Not found.',
    unauthorized: 'Unauthorized.',
    forbidden: 'Forbidden.',
    invalidData: 'Invalid data.',

    loginSuccess: 'Logged in successfully!',
    loginFailed: 'Invalid login or password.',
    logoutSuccess: 'Logged out.',
    tokenRequired: 'Token is required.',
    tokenInvalid: 'Token is invalid or expired.',
    adminOnly: 'Admins only.',

    fighterNotFound: 'Fighter not found.',
    fighterCreated: 'Fighter created.',
    fighterUpdated: 'Fighter updated.',
    fighterDeleted: 'Fighter deleted.',

    matchNotFound: 'Match not found.',
    matchCreated: 'Match created.',
    matchUpdated: 'Match updated.',
    matchDeleted: 'Match deleted.',

    videoNotFound: 'Video not found.',
    videoCreated: 'Video created.',
    videoUpdated: 'Video updated.',
    videoDeleted: 'Video deleted.',

    newsNotFound: 'News not found.',
    newsCreated: 'News article created.',
    newsUpdated: 'News article updated.',
    newsDeleted: 'News article deleted.',

    refereeNotFound: 'Referee not found.',
    refereeCreated: 'Referee created.',
    refereeUpdated: 'Referee updated.',
    refereeDeleted: 'Referee deleted.',

    ticketBooked: 'Ticket request accepted. Wait for admin confirmation!',
    ticketNotFound: 'Ticket not found.',
    ticketDeleted: 'Ticket deleted.',
    ticketStatusChanged: 'Status updated.',
    ticketRequired: 'Please fill all fields.',

    applicationSent: 'Your application was submitted successfully. We will contact you soon!',
    applicationNotFound: 'Application not found.',
    applicationDeleted: 'Application deleted.',
    applicationRequired: 'Name and phone number are required!',

    fanExists: 'This email is already registered.',
    fanRequired: 'Name and email are required.',
    fanCreated: 'Welcome! 100 coins bonus added.',
    fanNotFound: 'Fan not found.',
    fanDeleted: 'Fan deleted.',

    botRequired: 'Name and phone number are required.',
    botPhoneExists: 'This phone number is already registered.',
    botCodeSent: 'Verification code sent!',
    botCodeInvalid: 'Invalid or expired code.',
    botRegistered: 'Successfully registered!',

    courseNotFound: 'Course not found.',
    courseCreated: 'Course created.',
    courseUpdated: 'Course updated.',
    courseDeleted: 'Course deleted.',
  }
};

// Middleware: har so'rovga res.t() funksiyasini qo'shadi
function i18nMiddleware(req, res, next) {
  const lang = req.headers['accept-language'] || 'uz';
  const validLang = ['uz', 'ru', 'en'].includes(lang) ? lang : 'uz';

  res.t = (key) => {
    return (messages[validLang] && messages[validLang][key]) || messages['uz'][key] || key;
  };

  req.lang = validLang;
  next();
}

module.exports = { i18nMiddleware, messages };
