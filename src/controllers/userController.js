const firestoreService = require('../services/firestoreService');
const bcrypt = require('bcrypt');

const userController = {
  // Maneja el registro de un nuevo usuario
  register: async (req, res) => {
    try {
      const { email, password, nombre, numeroTelefonico, rolUser } = req.body;

      if (!email || !password) {
        return res.status(400).send({ message: 'El email y la contraseña son requeridos.' });
      }

      const existingUser = await firestoreService.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).send({ message: 'El usuario con este email ya existe.' });
      }

      const docRef = await firestoreService.registerUser(email, password, nombre, numeroTelefonico, rolUser);
      res.status(201).send({ message: 'Usuario registrado exitosamente.', id: docRef.id });

    } catch (error) {
      console.error('Error en el registro de usuario:', error);
      res.status(500).send({ message: 'Error interno del servidor.', error: error.message });
    }
},

  // Maneja el login de un usuario
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validar si los campos están presentes
      if (!email || !password) {
        return res.status(400).send({ message: 'El email y la contraseña son requeridos.' });
      }

      // Buscar el usuario por email
      const user = await firestoreService.findUserByEmail(email);
      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado.' });
      }

      // Comparar la contraseña ingresada con la hasheada
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).send({ message: 'Contraseña incorrecta.' });
      }

      // Login exitoso, puedes devolver el usuario o un token JWT (recomendado)
      res.status(200).send({ message: 'Login exitoso.', user: { id: user.id, email: user.email } });

    } catch (error) {
      console.error('Error en el login de usuario:', error);
      res.status(500).send({ message: 'Error interno del servidor.', error: error.message });
    }
  },

  // Maneja la actualización de un usuario
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).send({ message: 'No se proporcionaron datos para actualizar.' });
      }

      // La validación de que el email no exista ya se añadió en el servicio
      
      const updated = await firestoreService.updateUser(id, updateData);
      
      res.status(200).send({ message: 'Usuario actualizado exitosamente.' });
    } catch (error) {
        if (error.message.includes('El nuevo email ya está en uso')) {
            return res.status(409).send({ message: error.message });
        }
        console.error('Error al actualizar usuario:', error);
        res.status(500).send({ message: 'Error interno del servidor.', error: error.message });
    }
},

  // Maneja la eliminación de un usuario
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      const deleted = await firestoreService.deleteUser(id);
      if (!deleted) {
        return res.status(404).send({ message: 'Usuario no encontrado para eliminar.' });
      }

      res.status(200).send({ message: 'Usuario eliminado exitosamente.' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).send({ message: 'Error interno del servidor.', error: error.message });
    }
  }
};

module.exports = userController;