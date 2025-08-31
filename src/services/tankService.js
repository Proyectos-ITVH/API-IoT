const { db, admin } = require('./firestoreService');

const tankService = {
  getTanks: async () => {
    // Aquí la lógica de getTanks, getNextTankNumber, updateTank, deleteTank y createTank
    const snapshot = await db.collection('estanques').get();
    if (snapshot.empty) {
      return [];
    }
    const tanks = [];
    snapshot.forEach(doc => {
      tanks.push({ _id: doc.id, ...doc.data() });
    });
    return tanks;
  },
  getNextTankNumber: async () => {
    const snapshot = await db.collection('estanques').get();
    let maxNumber = 0;
    snapshot.forEach(doc => {
      const match = doc.id.match(/^Estanque(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });
    return maxNumber + 1;
  },
  updateTank: async (tankId, updateData) => {
    const tankRef = db.collection('estanques').doc(tankId);
    const doc = await tankRef.get();
    if (!doc.exists) {
      return false;
    }
    await tankRef.update(updateData);
    return true;
  },
  deleteTank: async (tankId) => {
    const tankRef = db.collection('estanques').doc(tankId);
    const doc = await tankRef.get();
    if (!doc.exists) {
      return false;
    }
    await tankRef.delete();
    return true;
  },
  createTank: async (estanqueId, tankData) => {
    const tankRef = db.collection('estanques').doc(estanqueId);
    await tankRef.set({
      ...tankData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { _id: estanqueId, ...tankData };
  }
};

module.exports = tankService;