const mongoose = require('mongoose');

const cuadranteSchema = new mongoose.Schema({
    identificador: { type: String, required: true },
    ultima_irrigacion: { type: Date, default: Date.now  },
    fecha_sensor_agregado: { type: Date, default: Date.now  },
    tipo_planta: { type: String, required: true }
});

const Cuadrante = mongoose.model('Cuadrante', cuadranteSchema);

module.exports = Cuadrante;
