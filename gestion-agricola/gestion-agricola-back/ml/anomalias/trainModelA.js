const tf = require('@tensorflow/tfjs-node');
const createAnomalyDetectionModel = require('./createModelA.js');
const { prepareAnomalyData } = require('./prepareDataA.js'); 

async function trainAnomalyDetectionModel() {
  try {
    console.log('Iniciando el entrenamiento del modelo...');

    // Paso 1: Preparar los datos
    const data = await prepareAnomalyData();  
    if (!data) {
      throw new Error('La función prepareAnomalyData no retornó datos válidos.');
    }
    console.log('Datos preparados correctamente:', data.shape);

    // Paso 2: Verificar formato de los datos
    if (data.shape[0] === 0) {
      throw new Error('Los datos preparados están vacíos (sin filas).');
    }

    // Paso 3: Crear el modelo
    const model = createAnomalyDetectionModel();
    console.log('Modelo creado:', model.summary());

    // Paso 4: Entrenar el modelo
    console.log('Entrenando el modelo...');
    const trainingStatus = await model.fit(data, data, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      shuffle: true,
    });
    console.log('Entrenamiento completado. Estadísticas:', trainingStatus.history);

    // Paso 5: Guardar el modelo
    await model.save('file://./ml/saved/anomaly');
    console.log('Modelo guardado en ./ml/saved/estanque');

  } catch (error) {
    console.error('Error durante el entrenamiento:', error);
  }
}

trainAnomalyDetectionModel();