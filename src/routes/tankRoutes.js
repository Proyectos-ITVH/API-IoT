const express = require('express');
const router = express.Router();
const tankController = require('../controllers/tankController');

// Rutas para los estanques
router.get('/tanks', tankController.getTanks);
router.put('/tanks/:id', tankController.updateTank);
router.delete('/tanks/:id', tankController.deleteTank);
router.post('/tanks', tankController.createTank);

module.exports = router;