const express = require('express');
const Estanque = require('../models/estanque'); // Asegúrate de que la ruta sea correcta
const router = express.Router();

// Obtener todos los estanques
router.get('/', async (req, res) => {
    try {
        const estanques = await Estanque.find();
        res.json(estanques);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Crear un nuevo estanque
router.post('/crear', async (req, res) => {
    const estanque = new Estanque({
        nombre: req.body.nombre,
        capacidad_maxima: req.body.capacidad_maxima,
        capacidad_actual: req.body.capacidad_actual,
        estado_funcionamiento: req.body.estado_funcionamiento,
        ultima_actualizacion: req.body.ultima_actualizacion
    });

    try {
        const nuevoEstanque = await estanque.save();
        res.status(201).json(nuevoEstanque);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Obtener un estanque por ID
router.get('/:id', async (req, res) => {
    try {
        const estanque = await Estanque.findById(req.params.id);
        if (!estanque) return res.status(404).json({ message: 'Estanque no encontrado' });
        res.json(estanque);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Actualizar un estanque
router.put('/:id', async (req, res) => {
    try {
        const estanque = await Estanque.findById(req.params.id);
        if (!estanque) return res.status(404).json({ message: 'Estanque no encontrado' });

        estanque.nombre = req.body.nombre !== undefined ? req.body.nombre : estanque.nombre;
        estanque.capacidad_maxima = req.body.capacidad_maxima !== undefined ? req.body.capacidad_maxima : estanque.capacidad_maxima;
        estanque.capacidad_actual = req.body.capacidad_actual !== undefined ? req.body.capacidad_actual : estanque.capacidad_actual;
        estanque.estado_funcionamiento = req.body.estado_funcionamiento !== undefined ? req.body.estado_funcionamiento : estanque.estado_funcionamiento;
        estanque.ultima_actualizacion = req.body.ultima_actualizacion || estanque.ultima_actualizacion;

        const actualizado = await estanque.save();
        res.json(actualizado);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Eliminar un estanque
router.delete('/:id', async (req, res) => {
    try {
        const estanque = await Estanque.findByIdAndDelete(req.params.id);
        if (!estanque) {
            return res.status(404).json({ message: 'Estanque no encontrado' });
        }
        res.status(200).json({ message: 'Estanque eliminado con éxito' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;