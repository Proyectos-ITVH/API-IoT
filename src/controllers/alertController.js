const {firestoreService} = require('../services/firestoreService');

const createAlert = async (req, res) => {
    try {
      const { problemas } = req.body;
  
      // Llama a la nueva función del servicio para guardar la alerta
      const newDocRef = await firestoreService.addAlert(problemas);
  
      res.status(201).json({
        message: 'Alerta creada exitosamente.',
        documentId: newDocRef.id,
      });
    } catch (error) {
      console.error('Error al crear la alerta:', error);
      res.status(500).json({
        message: 'Error interno del servidor al crear la alerta.',
      });
    }
  };
  
  module.exports = { createAlert };