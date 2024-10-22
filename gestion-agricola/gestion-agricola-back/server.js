const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const cuadranteRoutes = require('./routes/cuadrante');
const estanqueRoutes = require('./routes/estanque');
const sensoresRoutes = require('./routes/sensores');
const historialRoutes = require('./routes/historial');
const hsensoresRoutes = require('./routes/Hsensores');
const cors = require('cors');
const Usuario = require('./models/Usuario');
const Estanque = require('./models/estanque');
const Sensor = require('./models/sensores');
const hsensores = require('./models/Hsensores')
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
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

    /*const generarDatosSimulados = async () => {
        const capacidadEstanque = {
            nombre: 'Estanque 1',
            capacidad_maxima: 1000, // Capacidad máxima fija
            capacidad_actual: Math.round(Math.random() * 1000)  // Capacidad actual entre 0 y 1000 litros
        };
    
        // Actualizar la base de datos con la nueva capacidad actual
        try {
            await Estanque.updateOne(
                { nombre: 'Estanque 1' }, // Criterio de búsqueda
                { $set: { capacidad_actual: capacidadEstanque.capacidad_actual } } // Actualización
            );
            console.log('Capacidad actualizada en MongoDB');
        } catch (error) {
            console.error('Error al actualizar la base de datos:', error);
        }
    
        return capacidadEstanque; // Retornar solo el objeto de capacidad del estanque
    };*/

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


// Función para crear usuario administrador por defecto
const crearAdminPorDefecto = async () => {
try {
    const adminExiste = await Usuario.findOne({ nombreusuario: 'admin' });
    if (!adminExiste) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt); // Contraseña por defecto (cámbiala si es necesario)

        const admin = new Usuario({
            nombreusuario: 'admin',
            email: 'admin@example.com',  // Cambia el email si es necesario
            contrasena: hashedPassword,
        });

        await admin.save();
        console.log('Usuario administrador creado exitosamente');
    } else {
        console.log('El usuario administrador ya existe');
    }
} catch (error) {
    console.error('Error al crear usuario administrador:', error);
}
};

// Conectar a MongoDB
mongoose.connect('mongodb+srv://sebpino:hR82oZwG1tl8tex4@cluster0.p7flg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {})
.then(() => {
    console.log('Conectado a MongoDB');
    crearAdminPorDefecto(); // Llamada a la función para crear admin por defecto
})
.catch(err => console.error('Error de conexión:', err));

// Iniciar el servidor
server.listen(PORT, () => { 
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});


