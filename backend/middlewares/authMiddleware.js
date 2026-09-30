const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // Obtenemos el token de la cabecera (Header)
    const bearerHeader = req.headers['authorization'];

    if (!bearerHeader) {
        return res.status(403).json({ error: 'Acceso denegado. No hay token de seguridad.' });
    }

    // El formato suele ser "Bearer eyJhbGciOi..."
    const token = bearerHeader.split(' ')[1];

    try {
        // Verificamos si el token es real y no ha expirado
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verificado; // Guardamos los datos del usuario en la petición
        next(); // ¡Token válido! Lo dejamos pasar a la ruta
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado. Vuelve a iniciar sesión.' });
    }
};

module.exports = { verificarToken };