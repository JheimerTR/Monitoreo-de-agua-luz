const express = require('express');
const router = express.Router();

// 1. IMPORTAR LAS FUNCIONES DEL CONTROLADOR (¡Esto era lo que faltaba!)
// Nota: Si tus funciones en el controlador se llaman diferente (ej. "registrar" en vez de "crearDepartamento"), cámbialo aquí.
const { obtenerDepartamentos, crearDepartamento, cambiarEstado } = require('../controllers/departamentoController');

// 2. IMPORTAR AL GUARDIA DE SEGURIDAD
const { verificarToken } = require('../middlewares/authMiddleware'); 

// 3. RUTAS PROTEGIDAS POR EL GUARDIA
router.get('/', verificarToken, obtenerDepartamentos);
router.post('/', verificarToken, crearDepartamento);
router.put('/:id/estado', verificarToken, cambiarEstado); 

module.exports = router;