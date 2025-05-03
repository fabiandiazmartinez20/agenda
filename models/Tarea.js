// models/Tarea.js
const mongoose = require('mongoose');

const tareaSchema = new mongoose.Schema({
  usuario: { type: String, required: true },
  nombre: { type: String, required: true },
  asunto: { type: String, required: true },
  hora: { type: String, required: true },
  fecha: { type: String, required: true }
});

module.exports = mongoose.model('Tarea', tareaSchema);
