const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');
const cors = require('cors');
require('dotenv').config();

// Use a public DNS server for SRV lookups if the local resolver is unavailable.


const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '80mb' }));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

app.use('/api/auth', require('./routs/auth'));
app.use('/api/courses', require('./routs/courses'));
app.use('/api/students', require('./routs/students'));
app.use('/api/certificates', require('./routs/certificates'));
app.use('/api/notices', require('./routs/notices'));
app.use("/api/enquiry", require('./routs/enquiryrouts'));

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server Running on Port ${process.env.PORT || 5000}`);
});
