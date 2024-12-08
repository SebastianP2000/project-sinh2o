const express = require('express');
const Sensor = require('../models/Sensores');

const router = express.Router();

// Crear un nuevo sensor
router.post('/crear', async (req, res) => {
    const { sector, temperatura, humedad, estado } = req.body;
    const sensor = new Sensor({ sector, temperatura, humedad, estado });

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

        sensor.sector = req.body.sector || sensor.sector;
        sensor.temperatura = req.body.temperatura || sensor.temperatura;
        sensor.humedad = req.body.humedad || sensor.humedad;
        sensor.estado = req.body.estado !== undefined ? req.body.estado : sensor.estado;
        sensor.fecha_registro = req.body.fecha_registro || sensor.fecha_registro;

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

router.put('/quitarSensor/:id', async (req, res) => {
    try {
        const sensor = await Sensor.findById(req.params.id);
        if (!sensor) {
            return res.status(404).json({ message: 'Sensor no encontrado' });
        }

        // Poner el identificador a null
        sensor.identificador = null;

        const actualizado = await sensor.save();

        // Emitir a WebSocket
        const datosParaEnviar = {
            sensor: actualizado,  // Solo el sensor actualizado
        };

        connectedClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(datosParaEnviar));
            }
        });

        res.json(actualizado);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Ruta para asignar sensor
router.put('/asignarSensor/:id', async (req, res) => {
    try {
        const { identificador } = req.body;

        const sensor = await Sensor.findById(req.params.id);
        if (!sensor) {
            return res.status(404).json({ message: 'Sensor no encontrado' });
        }

        // Asignar el identificador al sensor
        sensor.identificador = identificador;

        const actualizado = await sensor.save();

        // Emitir a WebSocket
        const datosParaEnviar = {
            sensor: actualizado,  // Solo el sensor actualizado
        };

        connectedClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(datosParaEnviar));
            }
        });

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
