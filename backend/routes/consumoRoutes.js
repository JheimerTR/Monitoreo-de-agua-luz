const express = require('express');
const router = express.Router();
const { registrarConsumo, obtenerHistorial, modificarConsumo } = require('../controllers/consumoController');

router.post('/', registrarConsumo);
router.get('/', obtenerHistorial);
router.put('/:id', modificarConsumo); // <-- Cambiamos de DELETE a PUT

module.exports = router;