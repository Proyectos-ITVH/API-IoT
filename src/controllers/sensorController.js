const sensorService = require('../services/sensorService');
const { db } = require('../services/firestoreService');

const sensorController = {
  addSensorData: async (req, res) => {
    try {
      const { estanqueId, observaciones, ...sensorValues } = req.body; // Captura todos los valores de sensores dinámicamente

      if (!estanqueId) {
        return res.status(400).send({ message: 'ID del estanque es requerido.' });
      }

      // 1. Obtener los sensores asignados a este estanque
      const tankDoc = await db.collection('estanques').doc(estanqueId).get();
      if (!tankDoc.exists) {
        return res.status(404).send({ message: `Estanque con ID ${estanqueId} no encontrado.` });
      }
      const assignedSensors = tankDoc.data().sensores_asignados || {};

      // 2. Obtener la configuración de todos los tipos de sensores
      const sensorTypesSnapshot = await db.collection('Conf-sensores').get();
      const availableSensorTypes = {};
      sensorTypesSnapshot.forEach(doc => {
        availableSensorTypes[doc.id] = doc.data();
      });

      // 3. Validar los datos recibidos
      const validatedSensorData = {};
      for (const sensorName in sensorValues) {
        if (sensorValues.hasOwnProperty(sensorName)) {
          // Verificar si el sensor está asignado y habilitado (implicitamente true si está en el mapa)
          if (!assignedSensors[sensorName]) {
            return res.status(400).send({ message: `El sensor '${sensorName}' no está asignado al estanque ${estanqueId}.` });
          }
          // Verificar si el tipo de sensor existe globalmente
          if (!availableSensorTypes[sensorName]) {
            return res.status(400).send({ message: `El tipo de sensor '${sensorName}' no está definido en la configuración global.` });
          }
          // Aquí se podrían añadir validaciones de rango, tipo de dato, etc. usando availableSensorTypes[sensorName]
          // Por ejemplo: if (sensorValues[sensorName] < availableSensorTypes[sensorName].minValor) ...

          validatedSensorData[sensorName] = sensorValues[sensorName];
        }
      }

      // 4. Verificar que todos los sensores asignados al estanque tienen un valor en la petición
      for (const assignedSensorName in assignedSensors) {
        if (assignedSensors.hasOwnProperty(assignedSensorName) && assignedSensors[assignedSensorName] === true) {
          if (!validatedSensorData.hasOwnProperty(assignedSensorName)) {
            return res.status(400).send({ message: `Falta el valor para el sensor requerido: '${assignedSensorName}'.` });
          }
        }
      }

      // Asegurarse de que al menos un valor de sensor válido fue enviado
      if (Object.keys(validatedSensorData).length === 0) {
        return res.status(400).send({ message: 'No se recibieron datos de sensores válidos para guardar.' });
      }

      const sensorData = {
        estanqueId,
        valores_sensores: validatedSensorData
      };

      if (observaciones) {
        sensorData.observaciones = observaciones;
      }

      const docRef = await sensorService.addSensorData(sensorData);
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

      // Obtener los sensores actualmente asignados a este estanque
      const tankDoc = await db.collection('estanques').doc(estanqueId).get();
      if (!tankDoc.exists) {
        return res.status(404).send({ message: `Estanque con ID ${estanqueId} no encontrado.` });
      }
      const assignedSensors = tankDoc.data().sensores_asignados || {};
      const allowedSensorNames = Object.keys(assignedSensors).filter(key => assignedSensors[key] === true);

      const readings = await sensorService.getSensorReadings(estanqueId, limit);

      if (!readings || readings.length === 0) {
        return res.status(404).send({ message: `No se encontraron lecturas para el estanque con ID: ${estanqueId}.` });
      }
      
      // Filtrar los valores de los sensores en cada lectura
      const filteredReadings = readings.map(reading => {
        const filteredSensorValues = {};
        for (const sensorName of allowedSensorNames) {
          if (reading.valores_sensores && reading.valores_sensores.hasOwnProperty(sensorName)) {
            filteredSensorValues[sensorName] = reading.valores_sensores[sensorName];
          }
        }
        return { ...reading, valores_sensores: filteredSensorValues };
      });

      res.status(200).send(filteredReadings);

    } catch (error) {
      console.error('Error al obtener lecturas de sensor:', error);
      res.status(500).send({ message: 'Error interno del servidor.', error: error.message });
    }
  }
};

module.exports = sensorController;