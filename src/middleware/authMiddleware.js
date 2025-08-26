const jwt = require('jsonwebtoken');

// Asegúrate de que esta clave sea la misma que usaste en tu controlador de login
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_muy_seguro';

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).json({ message: 'No se proporcionó un token.' });
  }

  try {
    // Verificar si el token es válido
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    // Añadir la información del usuario decodificada a la solicitud
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token no válido.' });
  }
};

// Middleware para verificar si el usuario es administrador
const isAdmin = (req, res, next) => {
  // `req.user` contiene la información del usuario del middleware anterior
  if (req.user && req.user.rolUser === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
};