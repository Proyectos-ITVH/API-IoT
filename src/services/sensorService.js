const { db, admin } = require('./firestoreService');

const sensorService = {
  addSensorData: async (data) => {
    // Aquí la lógica de addSensorData y addArduinoData
    return await db.collection('lecturas_sensores').add({
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  },
  getSensorReadings: async (estanqueId, limit) => {
    // Aquí la lógica de getSensorReadings
    const query = db.collection('lecturas_sensores')
      .where('estanqueId', '==', estanqueId)
      .orderBy('timestamp', 'desc')
      .limit(limit);

    const snapshot = await query.get();
    if (snapshot.empty) {
      return [];
    }
    const readings = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.timestamp && typeof data.timestamp.toDate === 'function') {
        data.timestamp = data.timestamp.toDate().toISOString();
      }
      readings.push({ id: doc.id, ...data });
    });
    return readings;
  }
};

module.exports = sensorService;