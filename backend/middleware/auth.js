const jwt = require('jsonwebtoken');

// Verifica que la petición traiga un token JWT válido (RF11, RF12)
const verificarToken = (req, res, next) => {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'No autenticado' });
    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }
};

// Permite el acceso solo a usuarios con rol 'admin' (CU33)
const soloAdmin = (req, res, next) =>
    req.usuario?.rol === 'admin' ? next() : res.status(403).json({ error: 'Acceso denegado' });

module.exports = { verificarToken, soloAdmin };
