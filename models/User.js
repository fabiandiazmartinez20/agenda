const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userEmail: { type: String, required: true, unique: true },
  userPassword: { type: String, required: true }
});

// Especificamos el nombre de la colección 'usuarios'
const User = mongoose.model('User', userSchema, 'usuarios'); 

module.exports = User;
///aqui creare una coleccion que se llame tareas para la coleccion 