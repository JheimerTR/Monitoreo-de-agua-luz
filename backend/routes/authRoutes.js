const express = require('express');
const router = express.Router();
const { login, crearAdmin } = require('../controllers/authController');

router.post('/login', login);
router.get('/setup', crearAdmin); // Ruta para autogenerar el usuario

module.exports = router;