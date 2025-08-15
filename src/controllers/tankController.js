const firestoreService = require('../services/firestoreService');

const tankController = {
  getTanks: async (req, res) => {
    try {
      const tanks = await firestoreService.getTanks();
      if (tanks.length === 0) {
        return res.status(404).send({ message: 'No se encontraron estanques.' });
      }
      res.status(200).send(tanks);
    } catch (error) {
      console.error('Error al obtener estanques:', error);
      res.status(500).send({ message: 'Error interno del servidor.', error: error.message });
    }
  }
};

module.exports = tankController;