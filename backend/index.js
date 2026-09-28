const express = require('express');
const cors = require('cors');
const db = require('./config/db'); 

// 1. IMPORTAR RUTAS
const reporteRoutes = require('./routes/reporteRoutes');
const departamentoRoutes = require('./routes/departamentoRoutes'); 
const consumoRoutes = require('./routes/consumoRoutes'); 
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
// 2. INICIALIZAR APP (¡Esto debe ir antes de usar "app.use"!)
const app = express();

// 3. MIDDLEWARES
app.use(cors());
app.use(express.json());

// 4. ENDPOINT DE PRUEBA
app.get('/api/test', (req, res) => {
    db.query("SELECT 'Conexión exitosa a MySQL' AS mensaje", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

// 5. USAR LAS RUTAS
app.use('/api/departamentos', departamentoRoutes);
app.use('/api/consumos', consumoRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);

// 6. LEVANTAR SERVIDOR
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});