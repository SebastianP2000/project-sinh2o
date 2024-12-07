const tf = require('@tensorflow/tfjs-node');
const path = require('path');

async function loadModel() {
  try {
    const modelPath = path.join(__dirname, '..', 'ml', 'saved', 'temp-hum', 'model.json'); // Asegúrate de que la ruta es correcta
    console.log(`Cargando el modelo desde: ${modelPath}`);
    const model = await tf.loadLayersModel('file://' + modelPath); // Cargar el modelo
    return model;
  } catch (error) {
    console.error('Error al cargar el modelo:', error); // Captura el error de carga
    throw new Error('No se pudo cargar el modelo');
  }
}

module.exports = loadModel;
