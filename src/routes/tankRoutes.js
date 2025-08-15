const express = require('express');
const router = express.Router();
const tankController = require('../controllers/tankController');

// Rutas para los estanques
router.get('/tanks', tankController.getTanks);

module.exports = router;