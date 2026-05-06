const User = require('../models/User');
const Verification = require('../models/Verification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { sgMail, transporter } = require('../config/email');

exports.sendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    await Verification.findOneAndDelete({ email });
    await Verification.create({ email, code: verificationCode });
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Your verification code is:</p>
        <h1 style="background: #f4f4f4; padding: 20px; text-align: center; letter-spacing: 5px;">${verificationCode}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `;
    
    let emailSent = false;
    
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'your_sendgrid_api_key_here') {
      try {
        await sgMail.send({
          to: email,
          from: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER,
          subject: 'Email Verification Code - Car Rental',
          html: htmlContent
        });
        emailSent = true;
      } catch (error) { console.log('SendGrid failed:', error.message); }
    }
    
    if (!emailSent && transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Email Verification Code - Car Rental',
          html: htmlContent
        });
        emailSent = true;
      } catch (error) { console.log('Gmail failed:', error.message); }
    }
    
    if (!emailSent) {
      return res.json({ message: 'Verification code generated.', code: verificationCode });
    }
    return res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  const verification = await Verification.findOne({ email });
  if (!verification || verification.code !== code) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }
  await Verification.findOneAndDelete({ email });
  res.json({ message: 'Email verified successfully' });
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, gstNumber } = req.body;
    
    if (await User.findOne({ email })) return res.status(400).json({ message: 'User already exists' });

    if (role === 'vendor' && !gstNumber) {
      return res.status(400).json({ message: 'GST required for vendors' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { name, email, password: hashedPassword, role };
    
    if (role === 'vendor') {
      userData.gstNumber = gstNumber;
      userData.gstVerified = true;
    }
    
    const user = new User(userData);
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user._id, name, email, role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};