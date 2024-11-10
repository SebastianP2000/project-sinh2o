const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const cuadranteRoutes = require('./routes/cuadrante');
const estanqueRoutes = require('./routes/estanque');
const sensoresRoutes = require('./routes/sensores');
const historialRoutes = require('./routes/historial');
const hsensoresRoutes = require('./routes/hsensores');
const cors = require('cors');
const Usuario = require('./models/Usuario');
const Estanque = require('./models/Estanque');
const Sensor = require('./models/Sensores');
const hsensores = require('./models/Hsensores')
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ 
    origin: '*',
 }));
app.use(express.json());

// Usar las rutas de usuarios
app.use('/api/auth', authRoutes);
app.use('/api/cuadrantes', cuadranteRoutes);
app.use('/api/estanques', estanqueRoutes);
app.use('/api/sensores', sensoresRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/hsensores', hsensoresRoutes)

// Crear servidor HTTP
const server = http.createServer(app);

// WebSocket para manejar nuevas conexiones
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Nuevo cliente conectado a WebSocket');

    const sendDataFromDatabase = async () => {
        try {
            // Obtener estanques y sensores de la base de datos
            const estanques = await Estanque.find();
            const sensores = await Sensor.find();

            // Formatear los datos para enviar
            const datosParaEnviar = {
                estanques: estanques.map(estanque => ({
                    nombre: estanque.nombre,
                    capacidad_actual: estanque.capacidad_actual,
                    capacidad_maxima: estanque.capacidad_maxima
                })),
                sensores: sensores.map(sensor => ({
                    nombre: sensor.nombre,
                    temperatura: sensor.temperatura,
                    humedad: sensor.humedad,
                    sector: sensor.sector
                }))
            };

            // Enviar los datos al cliente WebSocket
            ws.send(JSON.stringify(datosParaEnviar));
        } catch (error) {
            console.error('Error al obtener datos de la base de datos:', error);
        }
    }; 

    // Enviar datos al cliente cuando se conecta
    sendDataFromDatabase();

    const intervalId = setInterval(sendDataFromDatabase, 2000); // Actualizar cada 10 segundos

    // Manejar la desconexión del cliente
    ws.on('close', () => {
        console.log('Cliente desconectado de WebSocket');
        clearInterval(intervalId);
    });
});

// Conectar a MongoDB
mongoose.connect('mongodb+srv://sebpino:hR82oZwG1tl8tex4@cluster0.p7flg.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0', {})
.then(() => {
    console.log('Conectado a MongoDB');
})
.catch(err => console.error('Error de conexión:', err));

// Iniciar el servidor
server.listen(process.env.PORT || 3000, () => { 
    console.log(`http://localhost:${process.env.PORT || 3000}`);
});
