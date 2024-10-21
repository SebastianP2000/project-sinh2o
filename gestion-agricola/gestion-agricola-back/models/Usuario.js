const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombreusuario: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contrasena: { type: String, required: true },
    fecharegistro: { type: Date, default: Date.now }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
