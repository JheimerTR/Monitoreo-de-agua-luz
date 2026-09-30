const express = require('express');
const router = express.Router();
const { obtenerResumenGlobal } = require('../controllers/reporteController');
const { verificarToken } = require('../middlewares/authMiddleware'); // <-- Importamos el guardia

router.get('/', verificarToken, obtenerResumenGlobal);

module.exports = router;