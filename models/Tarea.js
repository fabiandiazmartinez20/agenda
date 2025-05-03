// models/Tarea.js
const mongoose = require('mongoose');

const tareaSchema = new mongoose.Schema({
  usuario: { type: String, required: true },
  taskName: { type: String, required: true },
  taskSubject: { type: String, required: true },
  taskTime: { type: String, required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Campo de usuario

});

module.exports = mongoose.model('Tarea', tareaSchema);
