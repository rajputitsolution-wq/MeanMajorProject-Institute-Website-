const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Course = require('../models/course');

router.post('/add-courses', auth, async (req, res) => {
  const { name, fees, duration, description, category } = req.body;

  if (!name || !fees || !duration || !description) {
    return res.status(400).json({ msg: 'Please provide all required fields.' });
  }

  try {
    const course = new Course({
      name,
      fees,
      duration,
      description,
      category: category || 'Basic',
    });

    await course.save();
    res.json(course);
  } catch (err) {
    console.error('Course save error:', err);
    res.status(500).json({ msg: 'Unable to save course.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error('Course fetch error:', err);
    res.status(500).json({ msg: 'Unable to fetch courses.' });
  }
});

router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category?.trim();
    const courses = await Course.find({
      category: { $regex: new RegExp(`^${category}$`, 'i') }
    });
    res.json(courses);
  } catch (err) {
    console.error('Category course fetch error:', err);
    res.status(500).json({ msg: 'Unable to fetch category courses.' });
  }
});

module.exports = router;
