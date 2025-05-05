const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Tarea = require('./models/Tarea');

const app = express();
app.use(express.static('public'));

// CORS
const corsOptions = {
  origin: "https://prueba-e5160.web.app",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡API funcionando correctamente!');
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conexión a MongoDB exitosa'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Registrar nuevo usuario
app.post('/register', async (req, res) => {
  const { userName, userEmail, userPassword } = req.body;

  if (!userName || !userEmail || !userPassword) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(userEmail)) {
    return res.status(400).json({ error: 'Formato de correo electrónico no válido' });
  }

  try {
    const existingUser = await User.findOne({ userEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPassword, salt);

    const newUser = new User({
      userName,
      userEmail,
      userPassword: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error('❌ Error registrando al usuario:', err);
    res.status(500).json({ error: 'Hubo un error al registrar el usuario' });
  }
});

// Iniciar sesión
app.post('/login', async (req, res) => {
  const { userEmail, userPassword } = req.body;

  if (!userEmail || !userPassword) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const user = await User.findOne({ userEmail });
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(userPassword, user.userPassword);
    if (!isMatch) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  } catch (err) {
    console.error('❌ Error iniciando sesión:', err);
    res.status(500).json({ error: 'Hubo un error al iniciar sesión' });
  }
});

// Middleware JWT
const verifyToken = require('./authMiddleware');

app.get('/validar-token', verifyToken, (req, res) => {
  res.json({ message: 'Token válido', user: req.user });
});

// Guardar tarea
app.post('/tareas', async (req, res) => {
  const { taskName, taskSubject, taskTime, usuario, fecha } = req.body;

  if (!taskName || !taskSubject || !taskTime || !usuario) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const usuarioExistente = await User.findById(usuario);
    if (!usuarioExistente) {
      return res.status(400).json({ error: 'Usuario no válido' });
    }

    const nuevaTarea = new Tarea({
      taskName,
      taskSubject,
      taskTime,
      usuario,
      fecha,
    });
    await nuevaTarea.save();
    res.status(201).json({ message: 'Tarea guardada correctamente' });
  } catch (err) {
    console.error('❌ Error al guardar tarea:', err);
    res.status(500).json({ error: 'Error interno al guardar tarea' });
  }
});

// Obtener tareas por usuario (original)
app.get('/tareas/:usuarioId', async (req, res) => {
  try {
    const tareas = await Tarea.find({ usuario: req.params.usuarioId });
    res.status(200).json(tareas);
  } catch (err) {
    console.error('❌ Error obteniendo tareas:', err);
    res.status(500).json({ error: 'Error al obtener las tareas' });
  }
});

// ✅ NUEVA RUTA: Obtener tareas por fecha y usuario
app.get('/tareas', async (req, res) => {
  const { fecha, usuario } = req.query;

  if (!fecha || !usuario) {
    return res.status(400).json({ error: 'Faltan parámetros fecha o usuario' });
  }

  try {
    const tareas = await Tarea.find({
      usuario: usuario,
      fecha: fecha
    });

    res.status(200).json(tareas);
  } catch (err) {
    console.error('❌ Error obteniendo tareas por fecha y usuario:', err);
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});



// Eliminar tarea por ID
app.delete('/tareas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tareaEliminada = await Tarea.findByIdAndDelete(id);
    if (!tareaEliminada) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.status(200).json({ message: 'Tarea eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar tarea:', error);
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
