const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Asegúrate de tener el modelo de usuario

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extraer el token del header

  if (!token) {
    return res.status(403).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    // Agregar el usuario decodificado a la request para que se pueda usar en la siguiente ruta
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    req.user = user; // Establecer el usuario en la request
    next(); // Continuar con la siguiente función (ruta)
  });
};

module.exports = verifyToken;
