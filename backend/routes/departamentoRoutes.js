const express = require('express');
const router = express.Router();
const { soloAdmin } = require('../middleware/auth');
const { obtenerDepartamentos, registrarDepartamento, cambiarEstado } = require('../controllers/departamentoController');

// Rutas base: /api/departamentos
router.get('/', obtenerDepartamentos);
router.post('/', soloAdmin, registrarDepartamento);
router.put('/:id/estado', soloAdmin, cambiarEstado);

module.exports = router;