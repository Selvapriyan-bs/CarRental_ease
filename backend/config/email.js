const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const dns = require('dns');
require('dotenv').config();

// Force IPv4 first to fix ENETUNREACH IPv6 errors when connecting to Gmail
dns.setDefaultResultOrder('ipv4first');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

let transporter;
try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
} catch (err) {
  console.log('Email transporter setup failed:', err.message);
}

module.exports = { sgMail, transporter };