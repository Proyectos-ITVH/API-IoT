const express = require('express');
const app = express();
const cors = require('cors');
const sensorRoutes = require('./routes/sensorRoutes');
const tankRoutes = require('./routes/tankRoutes');
const userRoutes = require('./routes/userRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const alertRoutes = require('./routes/alertRoutes');
const sensorConfigRoutes = require('./routes/sensorConfigRoutes');

// Middleware para parsear JSON
app.use(express.json());

// Middleware para manejar CORS
app.use(cors());

//Status
app.get('/status', (req, res) => {
  res.json({ status: 'ok', message: 'API activa 🚀' });
});

// Monta las rutas de la API
app.use('/api', sensorRoutes);
app.use('/api', tankRoutes);
app.use('/api', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api', alertRoutes);
app.use('/api', sensorConfigRoutes);
// Ruta principal
app.get('/', (req, res) => {
  res.send('API de Monitoreo de Estanques de Peces está funcionando!');
});

module.exports = app;