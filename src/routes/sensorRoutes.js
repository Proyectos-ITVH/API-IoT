const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// Rutas para los datos de sensores y Arduino
router.post('/sensor-data', sensorController.addSensorData);
router.get('/sensor-readings/:estanqueId', sensorController.getSensorReadings);

module.exports = router;