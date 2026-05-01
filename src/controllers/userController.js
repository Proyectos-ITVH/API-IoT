const userService = require('../services/userService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Se requiere la biblioteca jsonwebtoken

// Considera mover esta clave a un archivo .env
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_muy_seguro';

const userController = {
  // Maneja el registro de un nuevo usuario
  // Maneja el registro de un nuevo usuario (creación en Auth y Firestore)
  register: async (req, res) => {
    try {
      const { email, password, nombre, numeroTelefonico, rolUser } = req.body;

      //Petición para extraer el nombre del usuario
      createdBy = req.user.nombre;

      // Validación de campos obligatorios
      if (!email || !password || !nombre) {
        return res.status(400).send({
          message: 'Nombre, email y contraseña son requeridos.'
        });
      }

      // Verifica si el email ya está registrado
      const existingUser = await userService.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).send({
          message: 'El usuario con este email ya existe.'
        });
      }

      // Llama al servicio para crear el usuario
      const result = await userService.registerUser(
        email,
        password,
        nombre,
        numeroTelefonico,
        rolUser,
        createdBy
      );

      res.status(201).send({
        message: 'Usuario registrado exitosamente.',
        id: result.id
      });

    } catch (error) {
      console.error('Error en el registro de usuario:', error);
      res.status(500).send({
        message: error.message || 'Error interno del servidor.'
      });
    }
  },

  // Maneja el login de un usuario
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).send({ message: 'El email y la contraseña son requeridos.' });
      }

      const user = await userService.findUserByEmail(email);
      if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado.' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).send({ message: 'Contraseña incorrecta.' });
      }

      // **CORRECCIÓN CRUCIAL**: Genera un token JWT para la sesión
      // Otra corrección, se añade el nombre del usuario para la creación de usuarios
      const token = jwt.sign({ uid: user.uid, rolUser: user.rolUser, nombre: user.nombre }, JWT_SECRET, { expiresIn: '1h' });

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
      const uid = req.user.uid;

      if (!uid) {
        return res.status(400).json({
          message: 'ID de usuario no proporcionado en la solicitud.'
        });
      }

      const user = await userService.getUserByUid(uid);

      if (!user) {
        return res.status(404).json({
          message: 'Usuario no encontrado.'
        });
      }

      delete user.password;

      res.status(200).json(user);

    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
      res.status(500).json({
        message: 'Error interno del servidor.'
      });
    }
  },

  //Maneja la actualización del perfil del usuario autentificado
  updateProfile: async (req, res) => {
    try {
      const uid = req.user.uid;
      const updateData = req.body;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).send({
          message: 'No se proporcionaron datos para actualizar.'
        });
      }

      // Buscar el documento por UID
      const user = await userService.getUserByUid(uid);

      if (!user) {
        return res.status(404).json({
          message: 'Usuario no encontrado.'
        });
      }

      // Actualizar usando docId
      const updated = await userService.updateUser(user.id, updateData);

      if (!updated) {
        return res.status(404).json({
          message: 'Usuario no encontrado.'
        });
      }

      res.status(200).send({
        message: 'Perfil actualizado exitosamente.'
      });

    } catch (error) {
      if (error.message.includes('email ya está en uso')) {
        return res.status(409).send({
          message: error.message
        });
      }

      console.error('Error al actualizar perfil:', error);
      res.status(500).send({
        message: 'Error interno del servidor.'
      });
    }
  },

  // Maneja la actualización de un usuario
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).send({
          message: 'No se proporcionaron datos para actualizar.'
        });
      }

      const updated = await userService.updateUser(id, updateData);

      if (!updated) {
        return res.status(404).json({
          message: 'Usuario no encontrado.'
        });
      }

      res.status(200).send({
        message: 'Usuario actualizado exitosamente.'
      });

    } catch (error) {
      if (error.message.includes('El email ya está en uso')) {
        return res.status(409).send({
          message: error.message
        });
      }

      console.error('Error al actualizar usuario:', error);
      res.status(500).send({
        message: 'Error interno del servidor.'
      });
    }
  },

// Maneja la eliminación de un usuario
deleteUser: async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await userService.deleteUser(id);
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
      const users = await userService.getUsers();
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