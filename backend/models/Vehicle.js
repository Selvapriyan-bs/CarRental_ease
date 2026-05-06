const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  images: [{ type: String }],
  available: { type: Boolean, default: true },
  onService: { type: Boolean, default: false },
  year: { type: Number, required: true },
  seats: { type: Number, required: true },
  transmission: { type: String, required: true },
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

module.exports = mongoose.model('Vehicle', vehicleSchema);