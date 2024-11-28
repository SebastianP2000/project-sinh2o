const mongoose = require('mongoose');
const HistorialSensor = require('../models/Hsensores'); // Ajusta el nombre si el archivo tiene otro nombre
const tf = require('@tensorflow/tfjs-node');  // Asegúrate de importar TensorFlow

const MONGODB_URL = 'mongodb+srv://sebpino:hR82oZwG1tl8tex4@cluster0.p7flg.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

async function fetchData() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URL);
    console.log('Conexión exitosa a MongoDB');

    // Consultar datos históricos solo con los campos necesarios
    const datos = await HistorialSensor.find({}, { temperatura: 1, humedad: 1 }); // Solo trae temperatura y humedad
    console.log('Datos obtenidos:', datos);

    // Transformar los datos para su uso en el modelo de predicción
    const datosTransformados = datos
      .map(d => ({
        temperatura: d.temperatura,
        humedad: d.humedad,
      }))
      .filter(d => d.temperatura != null && d.humedad != null);  // Asegúrate de filtrar los valores nulos

    console.log('Datos transformados:', datosTransformados);

    // Convertir los datos a tensores
    const inputs = tf.tensor2d(datosTransformados.map(d => [d.temperatura, d.humedad]));
    const labels = tf.tensor2d(datosTransformados.map(d => [d.temperatura, d.humedad])); // Ambas, temperatura y humedad

    console.log('Inputs:', inputs.shape);
    console.log('Labels:', labels.shape);

    // Cerrar conexión
    await mongoose.disconnect();
    console.log('Conexión cerrada');

    return { inputs, labels };  // Asegúrate de retornar los inputs y labels
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = fetchData;