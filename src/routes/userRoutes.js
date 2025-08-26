const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Ruta para el registro de usuarios
router.post('/users/register', userController.register);

// Ruta para el login de usuarios
router.post('/users/login', userController.login);

// Ruta para obtener todos los usuarios
router.get('/users', verifyToken, userController.getUsers);

// Ruta para actualizar un usuario
router.put('/users/:id', verifyToken, userController.updateUser);

// Ruta para eliminar un usuario
router.delete('/users/:id', verifyToken, userController.deleteUser);

// Ruta para obtener el perfil del usuario
router.get('/users/profile', verifyToken, userController.getProfile);  //       


module.exports = router;