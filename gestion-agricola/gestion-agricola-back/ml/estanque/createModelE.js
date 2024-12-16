const tf = require('@tensorflow/tfjs-node');

// Crear el modelo para predecir el consumo de agua
function createWaterModel(inputShape = [2], layers = [{ units: 16, activation: 'relu' }, { units: 8, activation: 'relu' }], outputUnits = 1) {  
  const model = tf.sequential();

  // Capa de entrada
  model.add(tf.layers.dense({ inputShape, units: layers[0].units, activation: layers[0].activation }));

  // Capas ocultas
  layers.slice(1).forEach(layer => {
    model.add(tf.layers.dense({ units: layer.units, activation: layer.activation }));
  });

  // Capa de salida: una unidad para el consumo de agua
  model.add(tf.layers.dense({ units: outputUnits, activation: 'linear' }));

  // Compilar el modelo
  model.compile({
    optimizer: tf.train.adam(),
    loss: 'meanSquaredError',
    metrics: ['mse'],
  });

  console.log('Modelo de consumo de agua creado');
  return model;
}

module.exports = createWaterModel;