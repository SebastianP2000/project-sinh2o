const tf = require('@tensorflow/tfjs-node');

// Crear un modelo de red neuronal simple con parámetros configurables
function createModel(inputShape = [2], layers = [{ units: 16, activation: 'relu' }, { units: 8, activation: 'relu' }], outputUnits = 2) {
  const model = tf.sequential();

  // Capa de entrada
  model.add(tf.layers.dense({ inputShape, units: layers[0].units, activation: layers[0].activation }));

  // Capas ocultas
  layers.slice(1).forEach(layer => {
    model.add(tf.layers.dense({ units: layer.units, activation: layer.activation }));
  });

  // Capa de salida: ahora tenemos 2 unidades para la predicción de temperatura y humedad
  model.add(tf.layers.dense({ units: outputUnits, activation: 'linear' }));

  // Compilar el modelo
  model.compile({
    optimizer: tf.train.adam(),
    loss: 'meanSquaredError',
    metrics: ['mse'],
  });

  console.log('Modelo creado');
  return model;
}

module.exports = createModel;