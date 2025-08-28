const {firestoreService} = require('../services/firestoreService');

const sensorController = {
  addSensorData: async (req, res) => {
    try {
      const { estanqueId, temperatura, ph, solidos_disueltos, oxigeno, turbidez, observaciones } = req.body;

      if (!estanqueId || !temperatura || !ph || !solidos_disueltos || !oxigeno || !turbidez) {
        return res.status(400).send({ message: 'Faltan parámetros requeridos de los sensores.' });
      }

      const sensorData = {
        estanqueId,
        valores_sensores: { temperatura, ph, solidos_disueltos, oxigeno, turbidez }
      };

      if (observaciones) {
        sensorData.observaciones = observaciones;
      }

      const docRef = await firestoreService.addSensorData(sensorData);
      console.log(`Datos de sensor guardados con ID: ${docRef.id}`);
      res.status(201).send({ message: 'Datos de sensor recibidos y guardados exitosamente.', id: docRef.id });

    } catch (error) {
      console.error('Error al guardar datos de sensor:', error);
      res.status(500).send({ message: 'Error interno del servidor.', error: error.message });
    }
  },

  getSensorReadings: async (req, res) => {
    try {
      const { estanqueId } = req.params;
      const limit = parseInt(req.query.limit) || 10;

      if (!estanqueId) {
        return res.status(400).send({ message: 'ID del estanque es requerido.' });
      }

      const readings = await firestoreService.getSensorReadings(estanqueId, limit);

      if (!readings || readings.length === 0) {
        return res.status(404).send({ message: `No se encontraron lecturas para el estanque con ID: ${estanqueId}.` });
      }
      
      res.status(200).send(readings);

    } catch (error) {
      console.error('Error al obtener lecturas de sensor:', error);
      res.status(500).send({ message: 'Error interno del servidor.', error: error.message });
    }
  }
};

module.exports = sensorController;