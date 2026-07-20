const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notice = require('../models/notice');

router.post('/add-notice', auth, async (req, res) => {
  const { title, message } = req.body;
  if (!message) {
    return res.status(400).json({ msg: 'Please provide a notice message.' });
  }

  try {
    const notice = new Notice({
      title: title || 'Notice',
      message,
    });
    await notice.save();
    res.json(notice);
  } catch (err) {
    console.error('Notice save error:', err);
    res.status(500).json({ msg: 'Unable to save notice.' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    console.error('Notice fetch error:', err);
    res.status(500).json({ msg: 'Unable to fetch notices.' });
  }
});

module.exports = router;
