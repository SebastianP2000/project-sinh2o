const mongoose = require('mongoose');
const HistorialSensor = require('../../models/Hsensores'); 
const tf = require('@tensorflow/tfjs-node');  

const MONGODB_URL = 'mongodb+srv://sebpino:hR82oZwG1tl8tex4@cluster0.p7flg.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

async function fetchData() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URL);
    console.log('Conexión exitosa a MongoDB');

    // Consultar datos históricos solo con los campos necesarios
    const datos = await HistorialSensor.find({}, { temperatura: 1, humedad: 1 }); 

    // Transformar los datos para su uso en el modelo de predicción
    const datosTransformados = datos
      .map(d => ({
        temperatura: d.temperatura,
        humedad: d.humedad,
      }))
      .filter(d => d.temperatura != null && d.humedad != null);

    console.log('Datos transformados:', datosTransformados);

   
    const inputs = tf.tensor2d(datosTransformados.map(d => [d.temperatura, d.humedad]));
    const labels = tf.tensor2d(datosTransformados.map(d => [d.temperatura, d.humedad])); 

    console.log('Inputs:', inputs.shape);
    console.log('Labels:', labels.shape);

   
    await mongoose.disconnect();
    console.log('Conexión cerrada');

    return { inputs, labels };  
  } catch (error) {
    console.error('Error:', error);
  }
}

module.exports = fetchData;