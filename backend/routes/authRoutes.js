const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const checkDB = require('../middleware/checkDB');

router.post('/send-verification', checkDB, authController.sendVerification);
router.post('/verify-email', checkDB, authController.verifyEmail);
router.post('/reset-password', checkDB, authController.resetPassword);
router.post('/register', checkDB, authController.register);
router.post('/login', checkDB, authController.login);

module.exports = router;