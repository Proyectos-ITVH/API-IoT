const { db, admin } = require('./firestoreService');

const alertService = {
  addAlert: async (alertData) => {
    // Aquí la lógica de addAlert de tu archivo original
    const timestamp = admin.firestore.FieldValue.serverTimestamp();
    const newAlert = {
      problemas: {
        ...alertData,
        timestamp: timestamp
      }
    };
    return await db.collection('alertas').add(newAlert);
  }
};

module.exports = alertService;