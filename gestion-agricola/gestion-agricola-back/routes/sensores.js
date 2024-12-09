const express = require('express');
const Sensor = require('../models/Sensores');

const router = express.Router();

// Crear un nuevo sensor
router.post('/crear', async (req, res) => {
    const { sensor_id, fecha_evento, humedad, identificador, temperatura } = req.body;
    const sensor = new Sensor({ sensor_id, fecha_evento, humedad, identificador, temperatura });

    try {
        const nuevoSensor = await sensor.save();
        res.status(201).json(nuevoSensor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Obtener todos los sensores
router.get('/', async (req, res) => {
    try {
        const sensores = await Sensor.find();
        res.json(sensores);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Actualizar un sensor por ID
router.put('/:id', async (req, res) => {
    try {
        const sensor = await Sensor.findById(req.params.id);
        if (!sensor) return res.status(404).json({ message: 'Sensor no encontrado' });

        sensor.sensor_id = req.body.sensor_id || sensor.sensor_id;
        sensor.fecha_evento = req.body.fecha_evento || sensor.fecha_evento;
        sensor.humedad = req.body.humedad || sensor.humedad;
        sensor.identificador = req.body.identificador || sensor.identificador;
        sensor.temperatura = req.body.temperatura || sensor.temperatura;

        const actualizado = await sensor.save();
        res.json(actualizado);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Eliminar un sensor por ID
router.delete('/:id', async (req, res) => {
    try {
        const sensor = await Sensor.findByIdAndDelete(req.params.id);
        if (!sensor) {
            return res.status(404).json({ message: 'Sensor no encontrado' });
        }
        res.status(200).json({ message: 'Sensor eliminado con éxito' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/quitarSensor/:sensorId', async (req, res) => {
    try {
        const sensor = await Sensor.findOne({ sensor_id: req.params.sensorId }); // Busca por sensor_id, no por _id
        if (!sensor) {
            return res.status(404).json({ message: 'Sensor no encontrado' });
        }

        // Asegúrate de que el identificador se ponga como null
        sensor.identificador = null;
        const actualizado = await sensor.save();
        res.json(actualizado);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
// Ruta para asignar sensor a un identificador
router.put('/asignarSensor/:sensorId', async (req, res) => {
    try {
        const { sensorId } = req.params;
        const { identificador } = req.body; // El identificador del cuadrante

        // Buscar el sensor por el sensorId
        const sensor = await Sensor.findOne({ sensor_id: sensorId });
        if (!sensor) {
            return res.status(404).json({ message: 'Sensor no encontrado' });
        }

        // Asignar el identificador del cuadrante al sensor
        sensor.identificador = identificador;

        // Guardar el sensor actualizado
        const actualizado = await sensor.save();
        res.json(actualizado);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Ruta para obtener sensores no asignados
router.get('/noAsignados', async (req, res) => {
    try {
        const sensoresNoAsignados = await Sensor.find({ identificador: null });
        res.json(sensoresNoAsignados);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
