const express = require("express");
const router = express.Router();

const Enquiry = require("../models/enquiry");
const auth = require("../middleware/auth");

router.post('/add-enquiry', async (req, res) => {
  const { name, email, phone, coursename, message } = req.body;

  if (!name || !email || !phone || !coursename || !message) {
    return res.status(400).json({ msg: 'Please provide all required fields.' });
  }

  try {
    const enquiry = new Enquiry({
      name,
      email,
      phone,
      coursename,
      message
    });

    await enquiry.save();
    res.json(enquiry);
  } catch (err) {
    console.error('Enquiry save error:', err);
    res.status(500).json({ msg: 'Unable to save enquiry.' });
  }
});

   
router.get('/', async (req, res) => {
  try {
    const enquiries = await Enquiry.find();
    res.json(enquiries);
  } catch (err) {
    console.error('Enquiry fetch error:', err);
    res.status(500).json({ msg: 'Unable to fetch enquiries.' });
  }
});


module.exports = router;