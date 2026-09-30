const express = require('express');
const router = express.Router();
const { registrarConsumo, obtenerHistorial, modificarConsumo } = require('../controllers/consumoController');
const { verificarToken } = require('../middlewares/authMiddleware'); // <-- Importamos el guardia

router.post('/', verificarToken, registrarConsumo);
router.get('/', verificarToken, obtenerHistorial);
router.put('/:id', verificarToken, modificarConsumo); 

module.exports = router;