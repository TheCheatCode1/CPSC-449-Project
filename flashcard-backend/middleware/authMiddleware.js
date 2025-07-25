// Backend: Middleware to validate JWT tokens and protect routes
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Make sure this matches your .env
    const user = await User.findById(decoded.id); // or decoded._id depending on your token

    if (!user) return res.status(401).json({ error: 'Invalid token: user not found' });

    req.user = user; // Attach user to request
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = auth;
