const express = require('express');
const router = express.Router();
const HistorialEstanque = require('../models/Hestanques')

router.get('/', async (req, res) => {
    try {
      const estanques = await HistorialEstanque.find();
      res.json(estanques);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los estanques' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const eliminado = await HistorialEstanque.findByIdAndDelete(id);
      if (!eliminado) return res.status(404).json({ error: 'Estanque no encontrado' });
      res.json({ message: 'Estanque eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar el estanque' });
    }
});
  
module.exports = router;