const express = require('express');
const router = express.Router();
const HistorialSensor = require('../models/Hsensores'); // Asegúrate de importar el modelo correctamente

// GET: Obtener todos los registros de Hsensores
router.get('/', async (req, res) => {
    try {
        const registros = await HistorialSensor.find();
        res.status(200).json(registros);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los registros', error });
    }
});

// Eliminar un registro por su ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params; // Obtener el ID del parámetro de la URL
    try {
        const resultado = await HistorialSensor.findByIdAndDelete(id);
        if (!resultado) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }
        res.status(200).json({ message: 'Registro eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el registro:', error); // Registro del error
        res.status(500).json({ message: 'Error al eliminar el registro', error });
    }
});


module.exports = router;
