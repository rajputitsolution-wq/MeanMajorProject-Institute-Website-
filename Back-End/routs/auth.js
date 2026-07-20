const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');
const Student = require('../models/student');
const Certificate = require('../models/certificate');
const Notice = require('../models/notice');

const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 3600000,
  path: '/'
};

router.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@1.com' && password === 'admin123') {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, cookieOptions);
    return res.json({ msg: 'Admin logged in', token });
  }
  res.status(400).json({ msg: 'Invalid credentials' });
});

router.post('/student/register', async (req, res) => {
  const { name, email, password, phone, course } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Name, email and password are required.' });
  }

  try {
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ msg: 'Email already registered.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const student = new Student({ name, email, password: hashedPassword, phone, course });
    await student.save();

    res.json({ msg: 'Student registered successfully.' });
  } catch (err) {
    console.error('Student register error:', err);
    res.status(500).json({ msg: 'Unable to register student.' });
  }
});

router.post('/student/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: 'Email and password are required.' });
  }

  try {
    const student = await Student.findOne({ email });
    if (!student || !student.password || !bcrypt.compareSync(password, student.password)) {
      return res.status(400).json({ msg: 'Invalid credentials.' });
    }

    const token = jwt.sign({ studentId: student._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, cookieOptions);
    res.json({ msg: 'Student logged in', token });
  } catch (err) {
    console.error('Student login error:', err);
    res.status(500).json({ msg: 'Unable to login student.' });
  }
});

router.get('/student/me', authMiddleware, async (req, res) => {
  if (!req.studentId) {
    return res.status(403).json({ msg: 'Student access only.' });
  }

  try {
    const student = await Student.findById(req.studentId).select('-password');
    if (!student) {
      return res.status(404).json({ msg: 'Student not found.' });
    }

    const certificates = await Certificate.find({ studentName: student.name }).sort({ createdAt: -1 });
    const notices = await Notice.find().sort({ createdAt: -1 });

    res.json({
      ...student.toObject(),
      certificates,
      notices
    });
  } catch (err) {
    console.error('Fetch student profile error:', err);
    res.status(500).json({ msg: 'Unable to fetch student profile.' });
  }
});

router.put('/student/update-profile', authMiddleware, async (req, res) => {
  if (!req.studentId) {
    return res.status(403).json({ msg: 'Student access only.' });
  }

  const { name, phone, parentName, course } = req.body;
  try {
    const student = await Student.findById(req.studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found.' });
    }

    if (name) student.name = name;
    if (phone !== undefined) student.phone = phone;
    if (parentName !== undefined) student.parentName = parentName;
    if (course !== undefined) student.course = course;

    await student.save();
    res.json({ msg: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Student profile update error:', err);
    res.status(500).json({ msg: 'Unable to update student profile.' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ msg: 'Logged out successfully.' });
});

router.put('/student/change-password', authMiddleware, async (req, res) => {
  if (!req.studentId) {
    return res.status(403).json({ msg: 'Student access only.' });
  }

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ msg: 'Old and new passwords are required.' });
  }

  try {
    const student = await Student.findById(req.studentId);
    if (!student || !student.password || !bcrypt.compareSync(oldPassword, student.password)) {
      return res.status(400).json({ msg: 'Old password is incorrect.' });
    }

    student.password = bcrypt.hashSync(newPassword, 10);
    await student.save();
    res.json({ msg: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ msg: 'Unable to update password.' });
  }
});

router.get('/dashboard', authMiddleware, async (req, res) => {

  try {
    if (!req.admin) {
      return res.status(403).json({ msg: 'Admin access only.' });
    }

    const coursesCount = await require('../models/course').countDocuments();
    const studentsCount = await Student.countDocuments();
    const certificatesCount = await Certificate.countDocuments();

    const latestNotice = await Notice.findOne().sort({ createdAt: -1 });

    res.json({
      coursesCount,
      studentsCount,
      certificatesCount,
      latestNotice: latestNotice?.message || 'No notices yet',
      noticeTitle: latestNotice?.title || 'Latest Notice'
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ msg: 'Unable to load dashboard data' });
  }
});

module.exports = router;
