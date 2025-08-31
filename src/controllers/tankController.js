const tankService = require('../services/tankService');

const tankController = {
  getTanks: async (req, res) => {
    try {
      const tanks = await tankService.getTanks();
      if (tanks.length === 0) {
        return res.status(404).send({ message: 'No se encontraron estanques.' });
      }
      res.status(200).send(tanks);
    } catch (error) {
      console.error('Error al obtener estanques:', error);
      res.status(500).send({ message: 'Error interno del servidor.', error: error.message });
    }
  },

  updateTank: async (req, res) => {
    try {
      const { id } = req.params;
      const tankData = req.body;
      const updated = await tankService.updateTank(id, tankData);
      if (!updated) {
        return res.status(404).send({ message: 'Estanque no encontrado.' });
      }
      res.status(200).send({ message: 'Estanque actualizado exitosamente.' });
    } catch (error) {
      console.error('Error al actualizar estanque:', error);
      res.status(500).send({ message: 'Error interno del servidor.', error: error.message });
    }
  },

  deleteTank: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await tankService.deleteTank(id);
      if (!deleted) {
        return res.status(404).send({ message: 'Estanque no encontrado.' });
      }
      res.status(200).send({ message: 'Estanque eliminado exitosamente.' });
    } catch (error) {
      console.error('Error al eliminar estanque:', error);
      res.status(500).send({ message: 'Error interno del servidor.', error: error.message });
    }
  },

  createTank: async (req, res) => {
    try {
      // Modifica la desestructuración para obtener 'id' y asignarlo a 'estanqueId'
      let { id, nombre, descripcion, capacidad } = req.body; // Obtener 'id' del cuerpo
      let estanqueId = id; // Asignar 'id' a 'estanqueId' para la lógica existente

      if (!nombre) {
        return res.status(400).send({ message: 'El nombre del estanque es obligatorio.' });
      }

      // Si no se proporcionó un ID personalizado (estanqueId sigue siendo undefined o null)
      if (!estanqueId || estanqueId.trim() === '') { // Añadir trim() para IDs vacíos
        const nextTankNumber = await tankService.getNextTankNumber();
        estanqueId = `Estanque${nextTankNumber}`;
      }

      descripcion = descripcion || "Estanque criadero";
      capacidad = capacidad || 5000;

      const newTank = await tankService.createTank(estanqueId, { nombre, descripcion, capacidad });

      res.status(201).send({
        message: 'Estanque creado exitosamente.',
        _id: newTank._id,
        nombre: newTank.nombre
      });

    } catch (error) {
      console.error('Error al crear estanque:', error);
      res.status(500).send({ message: 'Error interno del servidor.', error: error.message });
    }
  }
};

module.exports = tankController;