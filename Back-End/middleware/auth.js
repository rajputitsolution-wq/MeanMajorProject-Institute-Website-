const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const cookieHeader = req.headers.cookie || '';
  const tokenCookie = cookieHeader
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('token='));

  let token = tokenCookie ? tokenCookie.split('=')[1] : null;
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) return res.status(401).json({ msg: 'No Token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded.admin || false;
    req.studentId = decoded.studentId || null;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid Token' });
  }
};
