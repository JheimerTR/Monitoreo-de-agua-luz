const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Solo dejamos la ruta del login
router.post('/login', authController.login);

module.exports = router;