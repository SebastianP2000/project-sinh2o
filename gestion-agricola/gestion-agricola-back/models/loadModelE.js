const tf = require('@tensorflow/tfjs-node');
const path = require('path');

async function loadModel() {
  try {
    // Cambia la ruta del modelo a la de los estanques
    const modelPath = path.join(__dirname, '..', 'ml', 'saved', 'estanque', 'model.json');
    console.log(`Cargando el modelo desde: ${modelPath}`);
    const model = await tf.loadLayersModel('file://' + modelPath);
    return model;
  } catch (error) {
    console.error('Error al cargar el modelo:', error);
    throw new Error('No se pudo cargar el modelo');
  }
}

module.exports = loadModel;