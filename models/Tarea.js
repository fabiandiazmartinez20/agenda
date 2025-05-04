// models/Tarea.js
const mongoose = require('mongoose');

const tareaSchema = new mongoose.Schema({

  taskName: { type: String, required: true },
  taskSubject: { type: String, required: true },
  taskTime: { type: String, required: true },
  fecha: {type: String , required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Campo de usuario

});

module.exports = mongoose.model('Tarea', tareaSchema);
