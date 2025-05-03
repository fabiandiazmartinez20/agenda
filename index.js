const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//este es index.js

// Importar el modelo de Usuario
const User = require('./models/User');
// Al inicio del archivo
const Tarea = require('./models/Tarea');





const app = express();
app.use(express.static('public'));


const corsOptions = {
  origin: "https://prueba-e5160.web.app",  // Asegúrate de que esta URL sea la correcta
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));  // Agregar este middleware antes de las rutas

app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡API funcionando correctamente!');
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conexión a MongoDB exitosa'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// **Registrar nuevo usuario**
app.post('/register', async (req, res) => {
  const { userName, userEmail, userPassword } = req.body;

  if (!userName || !userEmail || !userPassword) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Validación de formato de correo electrónico
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(userEmail)) {
    return res.status(400).json({ error: 'Formato de correo electrónico no válido' });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ userEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPassword, salt);

    // Crear un nuevo usuario
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
  console.log("Datos recibidos:", req.body);  // Agrega esto para ver los datos que estás recibiendo

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


const verifyToken = require('./authMiddleware');

app.get('/validar-token', verifyToken, (req, res) => {
  res.json({ message: 'Token válido', user: req.user });
});

// Guardar una tarea
app.post('/tareas', async (req, res) => {
  const { taskName, taskSubject, taskTime, usuario } = req.body;

  if (!taskName || !taskSubject || !taskTime || !usuario) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const nuevaTarea = new Tarea({
      taskName,
      taskSubject,
      taskTime,
      usuario,  // Guardamos el usuario que corresponde
    });
    await nuevaTarea.save();
    res.status(201).json({ message: 'Tarea guardada correctamente' });
  } catch (err) {
    console.error('❌ Error al guardar tarea:', err);
    res.status(500).json({ error: 'Error interno al guardar tarea' });
  }
});


// Obtener tareas de un usuario para una fecha específica
app.get('/tareas/:usuario/:fecha', async (req, res) => {
  const { usuario, fecha } = req.params;
  const fechaParseada = new Date(fecha);

  try {
    const tareas = await Tarea.find({ 
      usuario: mongoose.Types.ObjectId(usuario), 
      taskTime: { $gte: fechaParseada, $lt: new Date(fechaParseada.getTime() + 24 * 60 * 60 * 1000) }
    });

    res.json(tareas);
  } catch (err) {
    console.error('❌ Error al obtener tareas:', err);
    res.status(500).json({ error: 'Error interno al obtener tareas' });
  }
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
