const mongoose = require('mongoose');

const historialSensorSchema = new mongoose.Schema({
    temperatura: { type: Number, required: true },
    humedad: { type: Number, required: true },
    sensor_id: { type: String, required: true},
    identificador: { type: String, required: true},
    fecha_evento: { type: Date, default: Date.now }
});

const HistorialSensor = mongoose.model('HistorialSensor', historialSensorSchema, 'Hsensores');

module.exports = HistorialSensor;
