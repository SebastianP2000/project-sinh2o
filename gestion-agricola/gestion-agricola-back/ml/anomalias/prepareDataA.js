const mongoose = require('mongoose');
const Sensores = require('../../models/Hsensores');  
const tf = require('@tensorflow/tfjs-node');

const MONGODB_URL = 'mongodb+srv://sebpino:hR82oZwG1tl8tex4@cluster0.p7flg.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';  

async function prepareAnomalyData() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(MONGODB_URL);
    console.log('Conexión exitosa a MongoDB');

    // Recuperar los datos
    const sensoresData = await Sensores.find({}, { temperatura: 1, humedad: 1 });
    console.log('Datos de sensores obtenidos:', sensoresData);

    if (!Array.isArray(sensoresData) || sensoresData.length === 0) {
      throw new Error('No se encontraron datos de sensores');
    }


    const validData = sensoresData.filter(sensor => sensor.temperatura !== null && sensor.humedad !== null);
    console.log('Datos válidos después del filtro:', validData);

    if (validData.length === 0) {
      throw new Error('No hay datos válidos para preparar');
    }

    // Mapear los datos a formato de tensor
    const data = validData.map(sensor => [sensor.temperatura, sensor.humedad]);
    console.log('Datos mapeados:', data);

    // Convertir a tensor
    const tensorData = tf.tensor2d(data);
    console.log('Tensor de datos:', tensorData.shape);

    // Normalizacion de los datos
    const max = tensorData.max(0);
    const min = tensorData.min(0);
    const normalizedData = tensorData.sub(min).div(max.sub(min));
    console.log('Datos normalizados:', normalizedData);

    return normalizedData;
  } catch (error) {
    console.error('Error en la preparación de datos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Conexión cerrada');
  }
}

module.exports = { prepareAnomalyData };
