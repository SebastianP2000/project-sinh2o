const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const cuadranteRoutes = require('./routes/cuadrante');
const estanqueRoutes = require('./routes/estanque');
const sensoresRoutes = require('./routes/sensores');
const historialRoutes = require('./routes/historial');
const hsensoresRoutes = require('./routes/hsensores');
const predictionRoutes = require('./routes/prediction');
const hestanquesRoutes = require('./routes/hestanques');
const cors = require('cors');
const Estanque = require('./models/Estanque');
const Sensor = require('./models/Sensores');


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
app.use('/api/hsensores', hsensoresRoutes);
app.use('/api/hestanques', hestanquesRoutes);
//rutas de ml
app.use('/api/prediction', predictionRoutes);

// Crear servidor HTTP
const server = http.createServer(app);

// WebSocket para manejar nuevas conexiones
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
const connectedClients = [];

wss.on('connection', (ws) => {
  console.log('Nuevo cliente conectado a WebSocket');
  connectedClients.push(ws);

  // Función para enviar los datos actuales de sensores y estanques
  const sendDataFromDatabase = async () => {
    try {
        const estanques = await Estanque.find();
        const sensores = await Sensor.find();

        // Verificar si el sensor está asignado
        const datosParaEnviar = {
            estanques: estanques.map(estanque => ({
                nombre: estanque.nombre,
                capacidad_actual: estanque.capacidad_actual,
                capacidad_maxima: estanque.capacidad_maxima
            })),
            sensores: sensores.map(sensor => ({
                sensor_id: sensor.sensor_id,
                temperatura: sensor.temperatura || 'No disponible', // Valor por defecto si no hay sensor
                humedad: sensor.humedad || 'No disponible', // Valor por defecto si no hay sensor
                identificador: sensor.identificador
            }))
        };

        connectedClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(datosParaEnviar));
            }
        });
    } catch (error) {
        console.error('Error al obtener datos de la base de datos:', error);
    }
};

  // Detecta cambios en la colección de sensores
  Sensor.watch().on('change', (change) => {
    console.log('Cambio detectado en sensor:', change);
    sendDataFromDatabase(); // Enviar datos al haber un cambio
  });

  // Detecta cambios en la colección de estanques
  Estanque.watch().on('change', (change) => {
    console.log('Cambio detectado en estanque:', change);
    sendDataFromDatabase(); // Enviar datos al haber un cambio
  });

  // Enviar datos iniciales al cliente cuando se conecta
  sendDataFromDatabase();

  // Manejo de la desconexión del cliente
  ws.on('close', () => {
    console.log('Cliente desconectado de WebSocket');
    const index = connectedClients.indexOf(ws);
    if (index !== -1) {
      connectedClients.splice(index, 1); // Elimina el cliente desconectado
    }
  });
});

// Conectar a MongoDB
mongoose.connect('mongodb+srv://sebpino:hR82oZwG1tl8tex4@cluster0.p7flg.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0', {})
.then(() => {
    console.log('Conectado a MongoDB');
})
.catch(err => console.error('Error de conexión:', err));

// desconexion de la base de datos
mongoose.connection.on('disconnected', () => {
    console.log('Desconectado de MongoDB');
});

// Iniciar el servidor
server.listen(PORT || 3000, () => { 
    console.log(`http://localhost:${ process.env.PORT || 3000}`);
});

