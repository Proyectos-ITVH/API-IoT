const firestoreService = require('../services/firestoreService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Se requiere la biblioteca jsonwebtoken

// Considera mover esta clave a un archivo .env
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_muy_seguro';

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

      if (!email || !password) {
        return res.status(400).send({ message: 'El email y la contraseña son requeridos.' });
      }

      const user = await firestoreService.findUserByEmail(email);
      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado.' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).send({ message: 'Contraseña incorrecta.' });
      }

      // **CORRECCIÓN CRUCIAL**: Genera un token JWT para la sesión
      const token = jwt.sign({ uid: user.id, rolUser: user.rolUser }, JWT_SECRET, { expiresIn: '1h' });

      // Login exitoso, se devuelve el token y los datos del usuario
      res.status(200).send({ 
        message: 'Login exitoso.', 
        token, // Se devuelve el token
        user: { 
          id: user.id, 
          email: user.email, 
          rolUser: user.rolUser // Propiedad corregida para que coincida con el frontend
        } 
      });

    } catch (error) {
      console.error('Error en el login de usuario:', error);
      res.status(500).send({ message: 'Error interno del servidor.', error: error.message });
    }
  },

  //Obtiene el perfil del usuario autenticado
  getProfile: async (req, res) => {
      try {
          const userId = req.user.uid; 
          
          if (!userId) {
              return res.status(400).json({ message: 'ID de usuario no proporcionado en la solicitud.' });
          }
          
          const user = await firestoreService.getUserById(userId);

          if (!user) {
              return res.status(404).json({ message: 'Usuario no encontrado.' });
          }

          res.status(200).json({
              id: user.id,
              email: user.email,
              nombre: user.nombre,
              rolUser: user.rolUser,
              numeroTelefonico: user.numeroTelefonico,
          });

      } catch (error) {
          console.error('Error al obtener el perfil del usuario:', error);
          res.status(500).json({ message: 'Error interno del servidor.' });
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
  },
  
  // Maneja la obtención de todos los usuarios
  getUsers: async (req, res) => {
    try {
      const users = await firestoreService.getUsers();
      if (users.length === 0) {
        return res.status(404).send({ message: 'No se encontraron usuarios.' });
      }
      res.status(200).send(users);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      res.status(500).send({ message: 'Error interno del servidor.', error: error.message });
    }
  },
};

module.exports = userController;