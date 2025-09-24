const { db } = require('../services/firestoreService');

// --- Controladores para Conf-sensores (Tipos de Sensores) ---

// Crear/Actualizar un tipo de sensor
const createOrUpdateSensorType = async (req, res) => {
  const { sensorId } = req.params; // e.g., 'temperatura', 'turbidez'
  const { nombre, unidad, descripcion } = req.body;

  if (!nombre || !unidad) {
    return res.status(400).send({ message: 'Nombre y unidad del sensor son requeridos.' });
  }

  try {
    await db.collection('Conf-sensores').doc(sensorId).set({
      nombre,
      unidad,
      descripcion: descripcion || '',
    }, { merge: true });
    res.status(200).send({ message: `Tipo de sensor ${sensorId} actualizado/creado exitosamente.` });
  } catch (error) {
    console.error('Error al crear/actualizar tipo de sensor:', error);
    res.status(500).send({ message: 'Error interno del servidor.' });
  }
};

// Obtener todos los tipos de sensores
const getAllSensorTypes = async (req, res) => {
  try {
    const snapshot = await db.collection('Conf-sensores').get();
    const sensorTypes = {};
    snapshot.forEach(doc => {
      sensorTypes[doc.id] = doc.data();
    });
    res.status(200).send(sensorTypes);
  } catch (error) {
    console.error('Error al obtener tipos de sensores:', error);
    res.status(500).send({ message: 'Error interno del servidor.' });
  }
};

// Obtener un tipo de sensor por ID
const getSensorTypeById = async (req, res) => {
  const { sensorId } = req.params;
  try {
    const doc = await db.collection('Conf-sensores').doc(sensorId).get();
    if (!doc.exists) {
      return res.status(404).send({ message: 'Tipo de sensor no encontrado.' });
    }
    res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error al obtener tipo de sensor por ID:', error);
    res.status(500).send({ message: 'Error interno del servidor.' });
  }
};

// Eliminar un tipo de sensor
const deleteSensorType = async (req, res) => {
  const { sensorId } = req.params;
  try {
    await db.collection('Conf-sensores').doc(sensorId).delete();
    res.status(200).send({ message: `Tipo de sensor ${sensorId} eliminado exitosamente.` });
  } catch (error) {
    console.error('Error al eliminar tipo de sensor:', error);
    res.status(500).send({ message: 'Error interno del servidor.' });
  }
};

// --- Controladores para asignación de sensores a estanques ---

// Asignar/Actualizar sensores para un estanque
const assignSensorsToTank = async (req, res) => {
  const { tankId } = req.params;
  const { sensors_asignados } = req.body; // e.g., { temperatura: true, turbidez: false, ph: true }

  if (!sensors_asignados || typeof sensors_asignados !== 'object') {
    return res.status(400).send({ message: 'Se requiere un objeto de sensores asignados.' });
  }

  try {
    // Validar que los sensores que se quieren asignar existen en Conf-sensores
    const sensorTypesSnapshot = await db.collection('Conf-sensores').get();
    const existingSensorTypes = new Set();
    sensorTypesSnapshot.forEach(doc => existingSensorTypes.add(doc.id));

    for (const sensorId in sensors_asignados) {
      if (sensors_asignados.hasOwnProperty(sensorId) && sensors_asignados[sensorId] === true) {
        if (!existingSensorTypes.has(sensorId)) {
          return res.status(400).send({ message: `El tipo de sensor '${sensorId}' no está definido en Conf-sensores.` });
        }
      }
    }

    await db.collection('estanques').doc(tankId).set({
      sensores_asignados: sensors_asignados,
    }, { merge: true }); // Usamos merge para solo actualizar este campo
    res.status(200).send({ message: `Sensores asignados al estanque ${tankId} actualizados exitosamente.` });
  } catch (error) {
    console.error('Error al asignar sensores al estanque:', error);
    res.status(500).send({ message: 'Error interno del servidor.' });
  }
};

// Obtener sensores asignados a un estanque
const getAssignedSensors = async (req, res) => {
  const { tankId } = req.params;
  try {
    const doc = await db.collection('estanques').doc(tankId).get();
    if (!doc.exists) {
      return res.status(404).send({ message: 'Estanque no encontrado.' });
    }
    res.status(200).send(doc.data().sensores_asignados || {});
  } catch (error) {
    console.error('Error al obtener sensores asignados al estanque:', error);
    res.status(500).send({ message: 'Error interno del servidor.' });
  }
};

module.exports = {
  createOrUpdateSensorType,
  getAllSensorTypes,
  getSensorTypeById,
  deleteSensorType,
  assignSensorsToTank,
  getAssignedSensors,
};
