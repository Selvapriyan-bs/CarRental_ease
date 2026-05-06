const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const auth = require('../middleware/auth');
const { upload, resizeImages } = require('../middleware/upload');

router.get('/', vehicleController.getVehicles);
router.get('/:id', vehicleController.getVehicle);
router.post('/', auth, upload.array('images', 5), resizeImages, vehicleController.createVehicle);
router.put('/:id', auth, upload.array('images', 5), resizeImages, vehicleController.updateVehicle);
router.delete('/:id', auth, vehicleController.deleteVehicle);

module.exports = router;