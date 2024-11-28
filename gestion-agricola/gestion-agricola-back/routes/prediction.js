const express = require('express');
const router = express.Router();
const loadModel = require('../models/loadModel'); // Cargamos el modelo
const tf = require('@tensorflow/tfjs-node');
const HistorialSensor = require('../models/Hsensores'); // Modelo para historial de sensores

// Endpoint para realizar predicciones
router.post('/predict', async (req, res) => {
  try {
    // Obtener todos los datos de temperatura y humedad desde MongoDB
    const sensorData = await HistorialSensor.find().sort({ fecha_evento: 1 }); // Obtenemos todos los registros de los sensores

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
    console.error('Error en la predicción:', error);
    res.status(500).send('Error en la predicción');
  }
});
module.exports = router;