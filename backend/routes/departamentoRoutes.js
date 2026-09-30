const express = require('express');
const router = express.Router();

// 1. Importamos las funciones con los NOMBRES EXACTOS de tu controlador
const { obtenerDepartamentos, registrarDepartamento, cambiarEstado } = require('../controllers/departamentoController');

// 2. Importamos al guardia de seguridad
const { verificarToken } = require('../middlewares/authMiddleware'); 

// 3. Rutas protegidas
router.get('/', verificarToken, obtenerDepartamentos);
router.post('/', verificarToken, registrarDepartamento); // <-- ¡Aquí estaba el error de nombre!
router.put('/:id/estado', verificarToken, cambiarEstado); 

module.exports = router;