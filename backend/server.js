const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Email transporter with multiple fallback options
let transporter;
try {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000
  });
} catch (err) {
  console.log('Email transporter setup failed:', err.message);
}

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/carrental')
  .then(() => console.log('✓ MongoDB connected successfully'))
  .catch(err => {
    console.error('✗ MongoDB connection error:', err.message);
    console.log('Please ensure MongoDB is running: mongod');
  });

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'temp_' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// Image resize middleware
const resizeImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    req.resizedFiles = [];
    
    for (const file of req.files) {
      const resizedFilename = file.filename.replace('temp_', 'resized_');
      const outputPath = path.join('uploads', resizedFilename);
      
      await sharp(file.path)
        .resize(1500, 1024, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 90 })
        .toFile(outputPath);
      
      // Delete temp file
      fs.unlinkSync(file.path);
      
      req.resizedFiles.push(`/uploads/${resizedFilename}`);
    }
    
    next();
  } catch (error) {
    console.error('Image resize error:', error);
    next(error);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
  // Vendor profile details
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  bankAccount: { type: String },
  ifscCode: { type: String },
  gstNumber: { type: String },
  gstVerified: { type: Boolean, default: false },
  vendorApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String }, // Keep for backward compatibility
  images: [{ type: String }], // New multiple images field
  available: { type: Boolean, default: true },
  year: { type: Number, required: true },
  seats: { type: Number, required: true },
  transmission: { type: String, required: true },
  // Additional detailed fields
  kilometers: { type: Number, default: 0 },
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'], default: 'Petrol' },
  registrationYear: { type: Number },
  manufacturingYear: { type: Number },
  owners: { type: String, enum: ['First', 'Second', 'Third', 'Fourth+'], default: 'First' },
  color: { type: String, default: 'White' },
  location: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  insurance: { type: String, enum: ['Comprehensive', 'Third Party', 'Expired'], default: 'Comprehensive' },
  registrationType: { type: String, enum: ['Individual', 'Commercial'], default: 'Individual' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  paymentId: { type: String },
  vendorPaid: { type: Boolean, default: false },
  vendorPaymentAmount: { type: Number },
  vendorBankAccount: { type: String },
  platformFee: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// Auth middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// DB connection check middleware
const checkDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database not connected. Please ensure MongoDB is running.' });
  }
  next();
};

// Routes
app.post('/api/send-verification', async (req, res) => {
  const { email } = req.body;
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  global.verificationCodes = global.verificationCodes || {};
  global.verificationCodes[email] = { code: verificationCode, timestamp: Date.now() };
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Your verification code is:</p>
      <h1 style="background: #f4f4f4; padding: 20px; text-align: center; letter-spacing: 5px;">${verificationCode}</h1>
      <p>This code will expire in 10 minutes.</p>
      <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
    </div>
  `;
  
  // Try SendGrid first
  if (process.env.SENDGRID_API_KEY) {
    try {
      await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER,
        subject: 'Email Verification Code - Car Rental',
        html: htmlContent
      });
      console.log(`✓ Email sent via SendGrid to ${email}`);
      return res.json({ message: 'Verification code sent to your email' });
    } catch (error) {
      console.log('SendGrid failed:', error.message);
    }
  }
  
  // Try Gmail as fallback
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification Code - Car Rental',
      html: htmlContent
    });
    console.log(`✓ Email sent via Gmail to ${email}`);
    return res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    console.log('Gmail failed:', error.message);
    return res.status(500).json({ message: 'Failed to send email. Please check your email configuration.' });
  }
});

app.post('/api/verify-email', (req, res) => {
  const { email, code } = req.body;
  
  if (!global.verificationCodes || !global.verificationCodes[email]) {
    return res.status(400).json({ message: 'No verification code found' });
  }
  
  const { code: storedCode, timestamp } = global.verificationCodes[email];
  const isExpired = Date.now() - timestamp > 10 * 60 * 1000; // 10 minutes
  
  if (isExpired) {
    delete global.verificationCodes[email];
    return res.status(400).json({ message: 'Verification code expired' });
  }
  
  if (storedCode !== code) {
    return res.status(400).json({ message: 'Invalid verification code' });
  }
  
  delete global.verificationCodes[email];
  res.json({ message: 'Email verified successfully' });
});

app.post('/api/reset-password', checkDB, async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    console.log(`✓ Password reset successful for: ${email}`);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/register', checkDB, async (req, res) => {
  try {
    const { name, email, password, role, gstNumber } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // GST validation for vendors
    if (role === 'vendor') {
      if (!gstNumber) {
        return res.status(400).json({ message: 'GST number is required for vendors' });
      }
      
      // Basic GST format validation (15 characters)
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(gstNumber)) {
        return res.status(400).json({ message: 'Invalid GST number format' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { name, email, password: hashedPassword, role };
    
    if (role === 'vendor') {
      userData.gstNumber = gstNumber;
      userData.gstVerified = true; // Mock verification for demo
      userData.vendorApproved = false; // Requires admin approval
    }
    
    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name, 
        email, 
        role,
        gstVerified: user.gstVerified,
        vendorApproved: user.vendorApproved
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/login', checkDB, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`Login attempt for: ${email}`);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Invalid password for: ${email}`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log(`✓ Login successful: ${email}`);
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('vendorId', 'name');
    // Migrate old vehicles with single image to images array
    const migratedVehicles = vehicles.map(v => {
      if (v.image && !v.images) {
        v.images = [v.image];
        v.save();
      }
      return v;
    });
    res.json(migratedVehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('vendorId', 'name email');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.post('/api/vehicles', auth, upload.array('images', 5), resizeImages, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') return res.status(403).json({ message: 'Only vendors can add vehicles' });
    
    const imageUrls = req.resizedFiles || [];
    if (imageUrls.length === 0) return res.status(400).json({ message: 'At least one image is required' });
    
    const vehicle = new Vehicle({ ...req.body, vendorId: req.user.id, images: imageUrls });
    await vehicle.save();
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/vehicles/:id', auth, upload.array('images', 5), resizeImages, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid vehicle ID' });
    }
    
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    
    if (vehicle.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this vehicle' });
    }
    
    const updateData = { ...req.body, updatedAt: new Date() };
    if (req.resizedFiles && req.resizedFiles.length > 0) {
      updateData.images = req.resizedFiles;
    }
    
    const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedVehicle);
  } catch (error) {
    console.error('Vehicle update error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/vehicles/:id', auth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    
    if (vehicle.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this vehicle' });
    }
    
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/create-order', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    const mockOrder = {
      id: `order_${Date.now()}`,
      amount: amount * 100,
      currency: 'INR'
    };
    
    res.json({ 
      orderId: mockOrder.id, 
      amount: mockOrder.amount,
      currency: mockOrder.currency,
      key: 'rzp_test_mock_key'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/verify-payment', auth, async (req, res) => {
  try {
    res.json({ success: true, paymentId: `pay_${Date.now()}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/users/profile', auth, async (req, res) => {
  try {
    const { name, phone, address, city, state, pincode, bankAccount, ifscCode } = req.body;
    
    const updateData = { name, phone, address, city, state, pincode };
    
    // Only vendors can update bank details
    if (req.user.role === 'vendor') {
      updateData.bankAccount = bankAccount;
      updateData.ifscCode = ifscCode;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/users/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/bookings', auth, async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ message: 'Only users can book vehicles' });
    
    const { vehicleId, startDate, endDate, total, paymentId } = req.body;
    
    // Check if vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId).populate('vendorId');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (!vehicle.available) return res.status(400).json({ message: 'Vehicle not available' });
    
    // Calculate platform fee (10%) and vendor payment
    const platformFee = total * 0.10;
    const vendorPayment = total - platformFee;
    
    const booking = new Booking({ 
      userId: req.user.id, 
      vehicleId, 
      startDate: new Date(startDate), 
      endDate: new Date(endDate), 
      total,
      paymentId,
      status: 'approved',
      vendorPaymentAmount: vendorPayment,
      vendorBankAccount: vehicle.vendorId.bankAccount,
      platformFee: platformFee,
      vendorPaid: true // Mock - In production, integrate with payment gateway
    });
    
    await booking.save();
    
    // In production: Trigger payment transfer to vendor's bank account
    console.log(`Payment Transfer: ₹${vendorPayment} to account ${vehicle.vendorId.bankAccount}`);
    
    res.json({
      booking,
      paymentDetails: {
        totalAmount: total,
        platformFee: platformFee,
        vendorPayment: vendorPayment,
        vendorAccount: vehicle.vendorId.bankAccount
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/bookings', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'user') query.userId = req.user.id;
    else if (req.user.role === 'vendor') {
      const vehicles = await Vehicle.find({ vendorId: req.user.id });
      query.vehicleId = { $in: vehicles.map(v => v._id) };
    }
    
    const bookings = await Booking.find(query).populate('userId', 'name').populate('vehicleId', 'name');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/bookings/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));