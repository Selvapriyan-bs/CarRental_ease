const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, state, pincode, bankAccount, ifscCode } = req.body;
    const updateData = { name, phone, address, city, state, pincode };
    if (req.user.role === 'vendor') {
      updateData.bankAccount = bankAccount;
      updateData.ifscCode = ifscCode;
    }
    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');
    res.json(user);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) { res.status(500).json({ message: error.message }); }
};