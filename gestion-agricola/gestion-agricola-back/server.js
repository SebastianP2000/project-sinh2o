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

    const generarDatosSimulados = async () => {
        const estanques = await Estanque.find();
        const sensores = await Sensor.find();
    
        // Actualizar capacidad de estanques
        for (const estanque of estanques) {
            const capacidadActual = Math.round(Math.random() * estanque.capacidad_maxima);
            await Estanque.updateOne({ _id: estanque._id }, { $set: { capacidad_actual: capacidadActual } });
        }
    
        // Agrupar sensores por cuadrante
        const sensoresPorCuadrante = {};
        for (const sensor of sensores) {
            const cuadrante = sensor.sector; // Supongamos que 'sector' indica el cuadrante
            if (!sensoresPorCuadrante[cuadrante]) {
                sensoresPorCuadrante[cuadrante] = [];
            }
            sensoresPorCuadrante[cuadrante].push(sensor);
        }
    
        // Generar datos para cada cuadrante
        for (const cuadrante in sensoresPorCuadrante) {
            const temperatura = parseFloat((Math.random() * 30 + 15).toFixed(2)); // Ejemplo: Temperatura entre 15 y 45
            const humedad = parseFloat((Math.random() * 100).toFixed(2)); // Ejemplo: Humedad entre 0 y 100%
    
            for (const sensor of sensoresPorCuadrante[cuadrante]) {
                await Sensor.updateOne(
                    { _id: sensor._id },
                    { $set: { temperatura, humedad } }
                );
                console.log(`Sensor actualizado en cuadrante ${cuadrante} - Temp: ${temperatura}, Hum: ${humedad}`);
            }
        }
    
        return { estanques, sensores }; // Retornar los objetos de estanques y sensores
    };
    



    const sendDataFromDatabase = async () => {
        const capacidadEstanque = await generarDatosSimulados(); // Genera datos falsos
        
        // Obtener todos los estanques después de la simulación
        const estanquesActualizados = await Estanque.find(); 
    
        // Prepara los datos para enviar todos los estanques
        const datosParaEnviar = estanquesActualizados.map(estanque => ({
            nombre: estanque.nombre,
            capacidad_actual: estanque.capacidad_actual,
        }));
    
        console.log('enviando datos:', datosParaEnviar); // Log de los datos que se envían
        ws.send(JSON.stringify(datosParaEnviar)); // Envía el objeto completo con todos los estanques
    };

    // Enviar datos al cliente cuando se conecta
    sendDataFromDatabase();

    const intervalId = setInterval(sendDataFromDatabase, 20000); // Actualizar cada 10 segundos

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


