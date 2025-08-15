const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Ruta para el registro de usuarios (CREATE)
router.post('/users/register', userController.register);

// Ruta para el login de usuarios
router.post('/users/login', userController.login);

// Ruta para actualizar un usuario (UPDATE)
router.put('/users/:id', userController.updateUser);

// Ruta para eliminar un usuario (DELETE)
router.delete('/users/:id', userController.deleteUser);

module.exports = router;