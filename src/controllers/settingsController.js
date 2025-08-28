// controllers/settingsController.js
const settingsService = require('../services/settingsService');

const settingsController = {
  getSettings: async (req, res) => {
    try {
      const settings = await settingsService.getSettings();
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener la configuración.', error: error.message });
    }
  },

  updateSettings: async (req, res) => {
    try {
      const { section } = req.params;
      const data = req.body;
      const result = await settingsService.updateSettings(section, data);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar la configuración.', error: error.message });
    }
  }
};

module.exports = settingsController;