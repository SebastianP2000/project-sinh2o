const mongoose = require('mongoose');

const historialSchema = new mongoose.Schema({
    tipo_evento: { 
        type: String, 
        enum: ['error', 'recarga'], // Solo permite estos dos valores
        required: true 
    },
    descripcion: { type: String, required: true },
    fecha_evento: { type: Date, default: Date.now } // Fecha por defecto
});

const Historial = mongoose.model('Historial', historialSchema);

module.exports = Historial;