const mongoose = require('mongoose');
const Estanque = require('../../models/Hestanques');
const tf = require('@tensorflow/tfjs-node');

const MONGODB_URL = 'mongodb+srv://sebpino:hR82oZwG1tl8tex4@cluster0.p7flg.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

async function fetchWaterData() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URL);
    console.log('Conexión exitosa a MongoDB');

    // Consultar datos históricos de los estanques
    const datos = await Estanque.find({}, { capacidad_maxima: 1, capacidad_anterior: 1 });
    console.log('Datos obtenidos:', datos);

    // Transformar los datos para su uso en el modelo de predicción
    const datosTransformados = datos
      .map(d => ({
        capacidad_maxima: d.capacidad_maxima,
        capacidad_anterior: d.capacidad_anterior,
        consumo: Math.abs(d.capacidad_maxima - d.capacidad_anterior), 
      }))
      .filter(d => d.capacidad_maxima != null && d.capacidad_anterior != null && d.consumo > 0); // Filtramos valores nulos y consumos válidos

    console.log('Datos transformados:', datosTransformados);

    // Convertir los datos a tensores (solo las dos características relevantes)
    const inputs = tf.tensor2d(datosTransformados.map(d => [d.capacidad_maxima, d.capacidad_anterior]));
    const labels = tf.tensor2d(datosTransformados.map(d => [d.consumo]));  // Solo el consumo de agua como etiqueta

    console.log('Inputs:', inputs.shape);
    console.log('Labels:', labels.shape);

    // Cerrar conexión
    await mongoose.disconnect();
    console.log('Conexión cerrada');

    return { inputs, labels };  // Retornamos los datos preparados para entrenamiento
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = fetchWaterData;