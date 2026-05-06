const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');

exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('vendorId', 'name');
    res.json(vehicles);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('vendorId', 'name email');
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createVehicle = async (req, res) => {
  try {
    if (req.user.role !== 'vendor') return res.status(403).json({ message: 'Unauthorized' });
    const imageUrls = req.resizedFiles || [];
    if (imageUrls.length === 0) return res.status(400).json({ message: 'Image required' });
    
    const vehicle = new Vehicle({ ...req.body, vendorId: req.user.id, images: imageUrls });
    await vehicle.save();
    res.json(vehicle);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle || vehicle.vendorId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    
    const updateData = { ...req.body, updatedAt: new Date() };
    if (req.resizedFiles?.length > 0) updateData.images = req.resizedFiles;
    
    const updated = await Vehicle.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle || vehicle.vendorId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};