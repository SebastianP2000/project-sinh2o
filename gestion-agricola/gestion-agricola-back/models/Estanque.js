const mongoose = require('mongoose');

const estanqueSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    capacidad_maxima: { type: Number, required: true },
    capacidad_actual: { type: Number, required: true },
    estado_funcionamiento: { type: Boolean, required: true, default: true }, // Se establece por defecto en true
    ultima_actualizacion: { type: Date, default: Date.now } // Se establece por defecto la fecha actual
});

const Estanque = mongoose.model('Estanque', estanqueSchema);

module.exports = Estanque;