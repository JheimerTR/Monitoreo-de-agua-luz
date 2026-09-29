const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { verificarToken, soloAdmin } = require('./middleware/auth');
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
if (!process.env.JWT_SECRET) {
    console.error('Falta JWT_SECRET en las variables de entorno');
    process.exit(1);
}
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost' }));
app.use(express.json({ limit: '10kb' }));

// Limita los intentos de login por IP (fuerza bruta)
const limiteLogin = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Demasiados intentos, espere 15 minutos' }
});

// 4. ENDPOINT DE PRUEBA
app.get('/api/test', (req, res) => {
    db.query("SELECT 'Conexión exitosa a MySQL' AS mensaje", (err, results) => {
        if (err) { console.error(err); return res.status(500).json({ error: 'Error interno del servidor' }); }
        res.json(results[0]);
    });
});

// 5. USAR LAS RUTAS
app.use('/api/auth', limiteLogin, authRoutes);
app.use('/api/departamentos', verificarToken, departamentoRoutes);
app.use('/api/consumos', verificarToken, consumoRoutes);
app.use('/api/reportes', verificarToken, reporteRoutes);
app.use('/api/usuarios', verificarToken, soloAdmin, usuarioRoutes);

// 6. LEVANTAR SERVIDOR
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
// 7. MANEJO DE ERRORES: nunca mostrar detalles internos al cliente
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Petición demasiado grande' });
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
});
