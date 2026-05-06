const mongoose = require('mongoose');

const checkDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.error('⚠️ Database not connected. Attempting to reconnect...');
    return res.status(503).json({ message: 'Database not connected. Please try again.' });
  }
  next();
};

module.exports = checkDB;