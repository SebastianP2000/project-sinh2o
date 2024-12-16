const express = require('express');
const router = express.Router();
const loadModel = require('../models/loadModel');
const loadModelE = require('../models/loadModelE'); 
const tf = require('@tensorflow/tfjs-node');
const HistorialSensor = require('../models/Hsensores'); // Modelo para historial de sensores
const HistorialEstanque = require('../models/Hestanques'); // Modelo para historial de estanques
const sensores = require('../models/Sensores')
const detectAnomaly = require('../models/detectAnomaly'); // Cargar la función de detección de anomalías


// Endpoint para realizar predicciones temperatura y humedad
router.post('/predictTH', async (req, res) => {
  try {
    // Obtener todos los datos de temperatura y humedad desde MongoDB
    console.log('Iniciando predicción T/H');
    const sensorData = await HistorialSensor.find().sort({ fecha_evento: 1 });
    console.log('Datos encontrados:', sensorData.length);
    
    // Verificamos si encontramos datos
    if (!sensorData || sensorData.length === 0) {
      return res.status(400).send('No se encontraron datos de sensores');
    }

    // Extraemos temperatura y humedad de todos los registros
    const inputData = sensorData.map(data => [data.temperatura, data.humedad]);

    // Calculamos el promedio de temperatura y humedad
    const avgTemperatura = inputData.reduce((acc, curr) => acc + curr[0], 0) / inputData.length;
    const avgHumedad = inputData.reduce((acc, curr) => acc + curr[1], 0) / inputData.length;

    console.log(`Promedio de datos - Temperatura: ${avgTemperatura}, Humedad: ${avgHumedad}`);

    // Cargamos el modelo
    const model = await loadModel();
    console.log("Modelo cargado correctamente.");

    // Hacemos la predicción para temperatura y humedad juntos
    const inputDataPrediccion = tf.tensor2d([[avgTemperatura, avgHumedad]]); // Pasamos ambos datos al modelo
    const prediccion = model.predict(inputDataPrediccion); // El modelo ahora predice ambos valores
    const resultado = prediccion.dataSync(); // Obtenemos los resultados predichos

    // Enviar la respuesta con las predicciones de temperatura y humedad
    res.json({
      temperatura_predicha: resultado[0],  // Temperatura predicha
      humedad_predicha: resultado[1],      // Humedad predicha
    });

  } catch (error) {
    console.error('Error detallado en predicción T/H:', error);
    res.status(500).json({
      mensaje: 'Error en la predicción',
      detalles: error.message
    });
  }
});

// Endpoint para realizar predicciones de consumo de agua de estanque
router.post('/predictW', async (req, res) => {
  try {
    // Obtener todos los datos de los estanques desde MongoDB
    console.log('Iniciando predicción estanque');
    const estanqueData = await HistorialEstanque.find().sort({ ultima_actualizacion: 1 });
    console.log('Datos encontrados:', estanqueData.length);

    // Verificar si hay datos disponibles
    if (!estanqueData || estanqueData.length === 0) {
      return res.status(400).send('No se encontraron datos de estanques');
    }

    // Extraemos y calculamos los datos necesarios para la predicción
    const consumoCalculado = estanqueData
      .map(data => ({
        consumo: data.capacidad_maxima - data.capacidad_anterior, // Consumo actual
        ultima_actualizacion: new Date(data.ultima_actualizacion).getTime(), // Convertimos la fecha a timestamp
        capacidad_maxima: data.capacidad_maxima,
      }))
      .filter(data => !isNaN(data.consumo) && !isNaN(data.ultima_actualizacion) && !isNaN(data.capacidad_maxima)); // Filtrar valores válidos

    // Verificar si hay datos válidos después del filtrado
    if (consumoCalculado.length === 0) {
      return res.status(400).send('No se encontraron datos válidos para la predicción');
    }

    // Calcular los promedios
    const avgConsumo = consumoCalculado.reduce((acc, curr) => acc + curr.consumo, 0) / consumoCalculado.length;
    const avgCapacidadMaxima = consumoCalculado.reduce((acc, curr) => acc + curr.capacidad_maxima, 0) / consumoCalculado.length;

    console.log(`Promedio de datos - Consumo: ${avgConsumo}, Capacidad Máxima: ${avgCapacidadMaxima}`);

    // Cargar el modelo de estanque
    const modelE = await loadModelE();
    console.log("Modelo de estanque cargado correctamente.");

    // Preparar los datos para la predicción
    const inputDataPrediccion = tf.tensor2d([[avgConsumo, avgCapacidadMaxima]]);
    
    // Realizar la predicción (solo predicción del consumo)
    const prediccion = modelE.predict(inputDataPrediccion);
    const resultado = prediccion.dataSync();

    // Enviar la respuesta con la predicción del consumo de agua
    res.json({
      consumo_predicho: resultado[0], // Solo consumo predicho
    });

  } catch (error) {
    console.error('Error detallado en predicción estanque:', error);
    res.status(500).json({
      mensaje: 'Error en la predicción del estanque',
      detalles: error.message
    });
  }
});

// Ruta para detectar anomalías
router.post('/detectAnomaly', async (req, res) => {
  try {
    // Obtener todos los datos de temperatura y humedad desde la colección `sensores`
    console.log('Obteniendo datos de sensores para detectar anomalías');
    const sensoresData = await sensores.find().sort({ fecha_evento: 1 });  // Cambié `Hsensores` a `sensores`

    // Verificar si se encontraron datos
    if (!sensoresData || sensoresData.length === 0) {
      return res.status(400).json({ mensaje: "No se encontraron datos de sensores para detectar anomalías" });
    }

    // Extraer los valores de temperatura y humedad de los sensores
    const inputData = sensoresData.map(data => ({
      temperatura: data.temperatura,
      humedad: data.humedad
    }));

    console.log('Datos extraídos de la colección sensores:', inputData);

    // Usar la función de detección de anomalías con los datos extraídos
    const anomalyDetected = await detectAnomaly(inputData);

    // Enviar la respuesta con el resultado
    res.json({
      anomalyDetected: anomalyDetected
    });
  } catch (error) {
    console.error('Error al detectar anomalías:', error);
    res.status(500).json({ mensaje: "Error al detectar anomalías", detalles: error.message });
  }
});

module.exports = router;