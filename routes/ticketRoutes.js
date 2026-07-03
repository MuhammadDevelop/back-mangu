const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ticketsFile = path.join(__dirname, '..', 'data', 'tickets.json');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'receipt_' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const getTickets = () => {
  try {
    if (!fs.existsSync(ticketsFile)) fs.writeFileSync(ticketsFile, '[]');
    return JSON.parse(fs.readFileSync(ticketsFile, 'utf8'));
  } catch {
    return [];
  }
};

const saveTickets = (tickets) => {
  fs.writeFileSync(ticketsFile, JSON.stringify(tickets, null, 2));
};

// POST /api/tickets/book
router.post('/book', upload.single('receipt'), (req, res) => {
  const { matchId, zone, price, name, phone } = req.body;
  if (!matchId || !zone || !name || !phone) {
    return res.status(400).json({ success: false, message: res.t('ticketRequired') });
  }

  const tickets = getTickets();
  const newTicket = {
    _id: Date.now().toString(),
    matchId,
    zone,
    price,
    name,
    phone,
    receipt: req.file ? `/uploads/${req.file.filename}` : '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  tickets.push(newTicket);
  saveTickets(tickets);
  res.json({ success: true, data: newTicket, message: "Chipta so'rovi qabul qilindi. Admin tasdiqlashini kuting!" });
});

// GET /api/tickets
router.get('/', (req, res) => {
  try {
    const tickets = getTickets();
    tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, data: tickets });
  } catch (err) {
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

// GET /api/tickets/match/:id
router.get('/match/:id', (req, res) => {
  const tickets = getTickets();
  const matchTickets = tickets.filter(t => t.matchId === req.params.id);
  res.json({ success: true, data: matchTickets });
});

// PUT /api/tickets/:id/status
router.put('/:id/status', (req, res) => {
  try {
    const tickets = getTickets();
    const { status } = req.body;
    const index = tickets.findIndex(t => t._id === req.params.id);

    if (index === -1) return res.status(404).json({ success: false, message: res.t('ticketNotFound') });

    tickets[index].status = status;
    saveTickets(tickets);
    res.json({ success: true, message: res.t('ticketStatusChanged') });
  } catch (err) {
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

// DELETE /api/tickets/:id
router.delete('/:id', (req, res) => {
  try {
    let tickets = getTickets();
    tickets = tickets.filter(t => t._id !== req.params.id);
    saveTickets(tickets);
    res.json({ success: true, message: res.t('ticketDeleted') });
  } catch (err) {
    res.status(500).json({ success: false, message: res.t('serverError') });
  }
});

module.exports = router;
