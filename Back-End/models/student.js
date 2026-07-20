const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  course: { type: String, default: '' },
  parentName: { type: String, default: '' },
  attendance: [
    {
      date: { type: Date, default: Date.now },
      status: { type: String, default: 'Present' }
    }
  ],
  schedule: [
    {
      day: { type: String, default: '' },
      subject: { type: String, default: '' },
      time: { type: String, default: '' }
    }
  ],
  subjects: [{ type: String }],
  fees: {
    total: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
    due: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
