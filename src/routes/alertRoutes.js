const express = require('express');
const router = express.Router();
const { createAlert } = require('../controllers/alertController'); // Adjust the path as needed

// This is the single POST route for your alert system.
router.post('/alerta', createAlert);

module.exports = router;