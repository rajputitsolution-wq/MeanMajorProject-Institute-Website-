const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/student');

router.post('/add-student', auth, async (req, res) => {
  const { name, email, phone, course } = req.body;
  if (!name || !email) {
    return res.status(400).json({ msg: 'Please provide student name and email.' });
  }
  try {
    const student = new Student({ name, email, phone, course });
    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ msg: 'Unable to save student.' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ msg: 'Unable to fetch students.' });
  }
});

module.exports = router;
