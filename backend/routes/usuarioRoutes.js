const express = require('express');
const router = express.Router();
const { obtenerUsuarios, registrarUsuario, cambiarEstado, desbloquearUsuario } = require('../controllers/usuarioController');
const { verificarToken } = require('../middlewares/authMiddleware'); // <-- Importamos el guardia

router.get('/', verificarToken, obtenerUsuarios);
router.post('/', verificarToken, registrarUsuario);
router.put('/:id/estado', verificarToken, cambiarEstado);
router.put('/:id/desbloquear', verificarToken, desbloquearUsuario);

module.exports = router;