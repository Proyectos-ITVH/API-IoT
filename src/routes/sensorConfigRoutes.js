const express = require('express');
const router = express.Router();
const sensorConfigController = require('../controllers/sensorConfigController');

// Rutas para la gestión de tipos de sensores (Conf-sensores)
// Crear o actualizar un tipo de sensor: PUT /api/sensor-config/types/:sensorId
router.put('/sensor-config/types/:sensorId', sensorConfigController.createOrUpdateSensorType);

// Obtener todos los tipos de sensores: GET /api/sensor-config/types
router.get('/sensor-config/types', sensorConfigController.getAllSensorTypes);

// Obtener un tipo de sensor por ID: GET /api/sensor-config/types/:sensorId
router.get('/sensor-config/types/:sensorId', sensorConfigController.getSensorTypeById);

// Eliminar un tipo de sensor: DELETE /api/sensor-config/types/:sensorId
router.delete('/sensor-config/types/:sensorId', sensorConfigController.deleteSensorType);

// Rutas para la asignación de sensores a estanques
// Asignar/Actualizar sensores para un estanque: PUT /api/sensor-config/tanks/:tankId/assign-sensors
router.put('/sensor-config/tanks/:tankId/assign-sensors', sensorConfigController.assignSensorsToTank);

// Obtener sensores asignados a un estanque: GET /api/sensor-config/tanks/:tankId/assigned-sensors
router.get('/sensor-config/tanks/:tankId/assigned-sensors', sensorConfigController.getAssignedSensors);

module.exports = router;
