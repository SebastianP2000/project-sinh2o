const mongoose = require('mongoose');

const historialSensorSchema = new mongoose.Schema({
    temperatura: { type: Number, required: true },
    humedad: { type: Number, required: true },
    fecha_evento: { type: Date, default: Date.now }
});

const HistorialSensor = mongoose.model('Hsensores', historialSensorSchema);

module.exports = HistorialSensor;
