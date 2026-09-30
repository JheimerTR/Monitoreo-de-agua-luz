const express = require('express');
const router = express.Router();
const { obtenerResumenGlobal, obtenerEstadisticas } = require('../controllers/reporteController');

// verificarToken se aplica en index.js para todo /api/reportes
router.get('/', obtenerResumenGlobal);
router.get('/estadisticas', obtenerEstadisticas); // Datos para los gráficos

module.exports = router;
