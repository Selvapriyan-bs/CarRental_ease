const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

exports.createBooking = async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ message: 'Only users can book' });
    const { vehicleId, startDate, endDate, total, paymentId } = req.body;
    
    const vehicle = await Vehicle.findById(vehicleId).populate('vendorId');
    if (!vehicle || !vehicle.available) return res.status(400).json({ message: 'Vehicle unavailable' });
    
    const platformFee = total * 0.10;
    const vendorPayment = total - platformFee;
    
    const booking = new Booking({ 
      userId: req.user.id, vehicleId, startDate, endDate, total, paymentId, status: 'approved',
      vendorPaymentAmount: vendorPayment, vendorBankAccount: vehicle.vendorId.bankAccount, platformFee, vendorPaid: true
    });
    
    await booking.save();
    res.json({ booking });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'user') query.userId = req.user.id;
    else if (req.user.role === 'vendor') {
      const vehicles = await Vehicle.find({ vendorId: req.user.id });
      query.vehicleId = { $in: vehicles.map(v => v._id) };
    }
    const bookings = await Booking.find(query).populate('userId', 'name').populate('vehicleId', 'name');
    res.json(bookings);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(booking);
  } catch (error) { res.status(500).json({ message: error.message }); }
};