const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/carrental');
    console.log('✓ MongoDB connected successfully');
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    console.log('Please ensure MongoDB is running: mongod');
  }
};

module.exports = connectDB;