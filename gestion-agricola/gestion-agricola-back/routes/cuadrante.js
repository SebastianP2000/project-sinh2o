const express = require('express');
const router = express.Router();
const Cuadrante = require('../models/Cuadrante');  // Asegúrate de que este modelo esté en la carpeta 'models'

// Crear un nuevo cuadrante
router.post('/crear', async (req, res) => {
    try {
        const nuevoCuadrante = new Cuadrante(req.body);
        await nuevoCuadrante.save();
        res.status(201).json(nuevoCuadrante);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener todos los cuadrantes
router.get('/', async (req, res) => {
    try {
        const cuadrantes = await Cuadrante.find();
        res.status(200).json(cuadrantes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener un cuadrante por ID
router.get('/cuadrante/:id', async (req, res) => {
    try {
        const cuadrante = await Cuadrante.findById(req.params.id);
        if (!cuadrante) {
            return res.status(404).json({ error: 'Cuadrante no encontrado' });
        }
        res.status(200).json(cuadrante);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar un cuadrante por ID
router.put('/:id', async (req, res) => {
    try {
        const cuadranteActualizado = await Cuadrante.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!cuadranteActualizado) {
            return res.status(404).json({ error: 'Cuadrante no encontrado' });
        }
        res.status(200).json(cuadranteActualizado);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar un cuadrante por ID
router.delete('/:id', async (req, res) => {
    try {
        const cuadranteEliminado = await Cuadrante.findByIdAndDelete(req.params.id);
        if (!cuadranteEliminado) {
            return res.status(404).json({ error: 'Cuadrante no encontrado' });
        }
        res.status(200).json({ mensaje: 'Cuadrante eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
