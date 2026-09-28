const express = require('express');
const router = express.Router();
const { obtenerUsuarios, registrarUsuario, cambiarEstado, desbloquearUsuario } = require('../controllers/usuarioController');

router.get('/', obtenerUsuarios);
router.post('/', registrarUsuario);
router.put('/:id/estado', cambiarEstado);
router.put('/:id/desbloquear', desbloquearUsuario);

module.exports = router;