const express = require('express');
const app = express();
const sensorRoutes = require('./routes/sensorRoutes');
const tankRoutes = require('./routes/tankRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware para parsear JSON
app.use(express.json());

//Status
app.get('/status', (req, res) => {
  res.json({ status: 'ok', message: 'API activa 🚀' });
});

// Monta las rutas de la API
app.use('/api', sensorRoutes);
app.use('/api', tankRoutes);
app.use('/api', userRoutes);
// Ruta principal
app.get('/', (req, res) => {
  res.send('API de Monitoreo de Estanques de Peces está funcionando!');
});

module.exports = app;