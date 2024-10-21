const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
    sector: { type: String, required: true },
    temperatura: { type: Number, required: true },
    humedad: { type: Number, required: true },
    estado: { type: Boolean, required: true, default: true },
    fecha_registro: { type: Date, default: Date.now }
});

const sensores = mongoose.model('Sensores', sensorSchema);

module.exports = sensores;
