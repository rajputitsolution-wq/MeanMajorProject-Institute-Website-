const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Certificate = require('../models/certificate');

router.post('/add-certificate', auth, async (req, res) => {
  const { certNo, studentName, courseName, issuedDate, status } = req.body;
  if (!certNo || !studentName || !courseName) {
    return res.status(400).json({ msg: 'Please provide certificate number, student, and course.' });
  }

  try {
    const certificate = new Certificate({
      certNo,
      studentName,
      courseName,
      issuedDate: issuedDate ? new Date(issuedDate) : undefined,
      status: status || 'Issued',
    });
    await certificate.save();
    res.json(certificate);
  } catch (err) {
    console.error('Certificate save error:', err);
    res.status(500).json({ msg: 'Unable to save certificate.' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    res.json(certificates);
  } catch (err) {
    console.error('Certificate fetch error:', err);
    res.status(500).json({ msg: 'Unable to fetch certificates.' });
  }
});

router.get('/:certNo', async (req, res) => {
  try {
    
    const certNo = req.params.certNo;
 
    const certificate = await Certificate.findOne({ certNo });

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json(certificate);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});
module.exports = router;
