const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/authMiddleware'); 

// Agregas "verificarToken" en el medio de la ruta
router.get('/', verificarToken, obtenerDepartamentos);
router.post('/', verificarToken, crearDepartamento);
module.exports = router;