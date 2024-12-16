const tf = require('@tensorflow/tfjs-node');

// Crear el modelo de Autoencoder para detección de fallos en los sensores
function createAnomalyDetectionModel(inputShape = [2], layers = [{ units: 16, activation: 'relu' }, { units: 8, activation: 'relu' }]) {
  const model = tf.sequential();

  // Codificador (Encoder)
  model.add(tf.layers.dense({ inputShape, units: layers[0].units, activation: layers[0].activation }));

  layers.slice(1).forEach(layer => {
    model.add(tf.layers.dense({ units: layer.units, activation: layer.activation }));
  });

  // Capa de cuello de botella (Bottleneck), que es la representación comprimida
  model.add(tf.layers.dense({ units: 4, activation: 'relu' }));

  // Decodificador (Decoder)
  model.add(tf.layers.dense({ units: layers[1].units, activation: layers[1].activation }));
  model.add(tf.layers.dense({ units: inputShape[0], activation: 'linear' }));

  // Compilar el modelo
  model.compile({
    optimizer: tf.train.adam(),
    loss: 'meanSquaredError',
    metrics: ['mse'],
  });

  console.log('Modelo de detección de anomalías creado');
  return model;
}

module.exports = createAnomalyDetectionModel;