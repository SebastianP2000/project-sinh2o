const tf = require('@tensorflow/tfjs-node');
const createModel = require('./createModel'); // Importamos el modelo
const prepareData = require('./prepareData'); // Importamos la función de datos

async function trainModel() {
  try {
    // Llamamos a prepareData para obtener los datos
    const { inputs, labels } = await prepareData();

    // Verificar si los datos están correctamente formateados
    console.log('Datos recibidos de prepareData:');
    console.log('Inputs:', inputs.shape);
    console.log('Labels:', labels.shape);

    if (!inputs || !labels || inputs.shape[0] === 0 || labels.shape[0] === 0) {
      console.error('Datos de entrenamiento vacíos o mal formateados');
      return;
    }

    // Crear el modelo
    const model = createModel([2], // Entradas: temperatura y humedad
      [{ units: 16, activation: 'relu' }, { units: 8, activation: 'relu' }], // Capas ocultas
      2 // Salidas: temperatura y humedad
    );

    // Entrenar el modelo
    console.log('Entrenando el modelo...');
    await model.fit(inputs, labels, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,  // Dividir los datos para validación
      shuffle: true,  // Mezclar los datos antes de cada época
      verbose: 1,
      callbacks: [
        tf.callbacks.earlyStopping({ monitor: 'loss', patience: 10 }),  // Detener si no mejora
      ],
    });

    console.log('Entrenamiento completado.');

    // Guardar el modelo entrenado
    await model.save('file://./ml/saved');
    console.log('Modelo guardado en ./ml/saved');
    
  } catch (error) {
    console.error('Error durante el entrenamiento:', error);
  }
}

trainModel().catch(console.error);