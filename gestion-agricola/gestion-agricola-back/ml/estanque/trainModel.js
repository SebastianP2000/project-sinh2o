const tf = require('@tensorflow/tfjs-node');
const createModel = require('./createModelE'); // Importamos el modelo de agua
const prepareData = require('./prepareDataE'); // Importamos la función de preparación de datos

async function trainWaterModel() {
  try {
    // Llamamos a prepareData para obtener los datos y el promedio de consumo
    const { inputs, labels } = await prepareData();

    // Verificar si los datos están correctamente formateados
    console.log('Datos recibidos de prepareData:');
    console.log('Inputs:', inputs.shape);
    console.log('Labels:', labels.shape);

    if (!inputs || !labels || inputs.shape[0] === 0 || labels.shape[0] === 0) {
      console.error('Datos de entrenamiento vacíos o mal formateados');
      return;
    }

    // Crear el modelo (con 2 entradas: capacidad_maxima y capacidad_anterior)
    const model = createModel([2], // Cambiado a 2 entradas
      [{ units: 16, activation: 'relu' }, { units: 8, activation: 'relu' }], // Capas ocultas
      1 // Salida: consumo de agua
    );

    // Compilar el modelo
    model.compile({
      optimizer: tf.train.adam(),
      loss: 'meanSquaredError',
      metrics: ['mse'], // Usar solo MSE
    });

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
    await model.save('file://./ml/saved/estanque');
    console.log('Modelo de consumo de agua guardado en ./ml/saved/estanque');
    
  } catch (error) {
    console.error('Error durante el entrenamiento:', error);
  }
}

trainWaterModel().catch(console.error);