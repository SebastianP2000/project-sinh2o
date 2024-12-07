const mongoose = require('mongoose');

const historialEstanqueSchema = new mongoose.Schema({
    nombre: { type: String, required: true }, 
    capacidad_maxima: { type: Number, required: true }, 
    capacidad_anterior: { type: Number, required: true }, 
    ultima_actualizacion: { type: Date, default: Date.now },
});

const HistorialEstanque = mongoose.model('HistorialEstanque', historialEstanqueSchema, 'Hestanques');
  
module.exports = HistorialEstanque;