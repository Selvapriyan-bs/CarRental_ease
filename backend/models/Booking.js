const mongoose = require('mongoose');

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

module.exports = mongoose.model('Booking', bookingSchema);