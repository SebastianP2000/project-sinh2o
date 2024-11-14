const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
    sensor_id: { type: String, required: true },
    fecha_registro: { type: Date, default: Date.now },
    humedad: { type: Number, required: true },
    identificador: { type: String, required: true },
    temperatura: { type: Number, required: true }
});

const sensores = mongoose.model('Sensores', sensorSchema);

module.exports = sensores;
