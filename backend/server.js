const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect Database
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api', require('./routes/authRoutes')); // Contains login, register, etc
// Also support the old root /send-verification if frontend uses it
app.post('/send-verification', require('./controllers/authController').sendVerification);

app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api', require('./routes/paymentRoutes')); // /create-order, /verify-payment

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));