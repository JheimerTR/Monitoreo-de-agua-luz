const express = require('express');
const router = express.Router();
const { obtenerDepartamentos, registrarDepartamento, cambiarEstado } = require('../controllers/departamentoController');

// Rutas base: /api/departamentos
router.get('/', obtenerDepartamentos);
router.post('/', registrarDepartamento);
router.put('/:id/estado', cambiarEstado);

module.exports = router;