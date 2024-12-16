const mongoose = require('mongoose');
const Sensores = require('../models/Sensores');  // Ruta correcta al modelo de Sensores
const tf = require('@tensorflow/tfjs-node');
const path = require('path');

// Variable global para almacenar el modelo cargado
let anomalyModel = null;

// Cargar el modelo de anomalías una sola vez
async function loadAnomalyModel() {
  if (anomalyModel) {
    return anomalyModel; // Si ya está cargado, lo reutilizamos
  }

  try {
    const modelPath = path.join(__dirname, '..', 'ml', 'saved', 'anomaly', 'model.json'); // Ruta al modelo entrenado
    console.log(`Cargando el modelo desde: ${modelPath}`);
    anomalyModel = await tf.loadLayersModel('file://' + modelPath);
    console.log('Modelo de anomalías cargado correctamente');
    return anomalyModel;
  } catch (error) {
    console.error('Error al cargar el modelo de anomalías:', error);
    throw new Error('No se pudo cargar el modelo de anomalías');
  }
}

// Detectar anomalía en los datos proporcionados
async function detectAnomaly() {
  try {
    // Paso 1: Obtener los datos de Sensores
    const sensoresData = await Sensores.find({}, { temperatura: 1, humedad: 1 });
    if (!Array.isArray(sensoresData) || sensoresData.length === 0) {
      throw new Error('No se encontraron datos de sensores');
    }
    console.log('Datos de sensores obtenidos:', sensoresData);

    // Paso 2: Preprocesar y normalizar los datos
    const validData = sensoresData.filter(sensor => sensor.temperatura !== null && sensor.humedad !== null);
    if (validData.length === 0) {
      throw new Error('No hay datos válidos para procesar');
    }

    const data = validData.map(sensor => [sensor.temperatura, sensor.humedad]);
    const tensorData = tf.tensor2d(data);
    const max = tensorData.max(0);
    const min = tensorData.min(0);
    const normalizedData = tensorData.sub(min).div(max.sub(min));

    console.log('Datos normalizados:', normalizedData.shape);

    // Paso 3: Cargar el modelo
    const model = await loadAnomalyModel();

    // Paso 4: Detectar anomalías en los datos
    const predictions = model.predict(normalizedData);
    const error = tf.losses.meanSquaredError(normalizedData, predictions);
    const threshold = 0.01; // Umbral de detección de anomalía

    // Paso 5: Evaluar si hay anomalía
    if (error.dataSync()[0] > threshold) {
      console.log('¡Anomalía detectada!');
      return true;
    } else {
      console.log('Datos normales');
      return false;
    }
  } catch (error) {
    console.error('Error al detectar anomalía:', error);
    throw new Error('No se pudo detectar la anomalía');
  }
}

module.exports = detectAnomaly;