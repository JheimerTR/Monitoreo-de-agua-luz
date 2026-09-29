const express = require('express');
const router = express.Router();
const { soloAdmin } = require('../middleware/auth');
const { registrarConsumo, obtenerHistorial, modificarConsumo } = require('../controllers/consumoController');

router.post('/', registrarConsumo);
router.get('/', obtenerHistorial);
router.put('/:id', soloAdmin, modificarConsumo); // Solo administradores (CU33)

module.exports = router;