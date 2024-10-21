// routes/historial.js
const express = require('express');
const router = express.Router();
const Historial = require('../models/Historial'); // Asegúrate de que la ruta sea correcta

// Ruta para crear un historial
router.post('/crear', async (req, res) => {
    const historial = new Historial(req.body);
    try {
        const nuevoHistorial = await historial.save();
        res.status(201).json(nuevoHistorial);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Ruta para obtener todos los historiales
router.get('/', async (req, res) => {
    try {
        const historiales = await Historial.find();
        res.json(historiales);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Ruta para eliminar un historial
router.delete('/:id', async (req, res) => {
    try {
        const resultado = await Historial.findByIdAndDelete(req.params.id);
        if (!resultado) return res.status(404).json({ message: 'Evento no encontrado' });
        res.json({ message: 'Evento eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
