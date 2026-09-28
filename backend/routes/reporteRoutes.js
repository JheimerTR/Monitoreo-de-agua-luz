const express = require('express');
const router = express.Router();
const { obtenerResumenGlobal } = require('../controllers/reporteController');

router.get('/', obtenerResumenGlobal);

module.exports = router;