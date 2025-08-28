// services/settingsService.js
const { db } = require('./firestoreService');

const SETTINGS_DOC_ID = 'system_settings'; // ID fijo para el documento de configuración

const settingsService = {
  getSettings: async () => {
    try {
      const docRef = db.collection('configuracion').doc(SETTINGS_DOC_ID);
      const doc = await docRef.get();
      if (!doc.exists) {
        // Devuelve un objeto vacío si no existe, o un valor por defecto
        return {};
      }
      return doc.data();
    } catch (error) {
      console.error('Error al obtener la configuración:', error);
      throw error;
    }
  },

  updateSettings: async (section, data) => {
    try {
      const docRef = db.collection('configuracion').doc(SETTINGS_DOC_ID);
      // Actualiza solo los campos de la sección especificada
      const updateData = {
        [section.toLowerCase()]: data
      };
      await docRef.set(updateData, { merge: true });
      return { message: `Configuración de ${section} actualizada.` };
    } catch (error) {
      console.error('Error al actualizar la configuración:', error);
      throw error;
    }
  }
};

module.exports = settingsService;