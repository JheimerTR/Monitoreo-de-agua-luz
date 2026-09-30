const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // <-- Importamos JWT

const login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Debe ingresar usuario y contraseña' });
    }

    db.query("SELECT * FROM Usuarios WHERE username = ?", [username], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

        const usuario = results[0];

        if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
            return res.status(403).json({ error: 'Cuenta bloqueada por múltiples intentos fallidos.' });
        }

        // Validación estricta con bcrypt
        const contraseñaValida = bcrypt.compareSync(password, usuario.password_hash);

        if (!contraseñaValida) {
            const nuevosIntentos = usuario.intentos_fallidos + 1;
            if (nuevosIntentos >= 3) {
                db.query("UPDATE Usuarios SET intentos_fallidos = ?, bloqueado_hasta = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id_usuario = ?", [nuevosIntentos, usuario.id_usuario]);
                return res.status(403).json({ error: 'Cuenta bloqueada. Intente en 15 minutos.' });
            } else {
                db.query("UPDATE Usuarios SET intentos_fallidos = ? WHERE id_usuario = ?", [nuevosIntentos, usuario.id_usuario]);
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
        }

        // Si la contraseña es correcta, reseteamos los intentos
        db.query("UPDATE Usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id_usuario = ?", [usuario.id_usuario]);
        
        // Creamos el Token de seguridad (Pulsera VIP)
        const token = jwt.sign(
            { id: usuario.id_usuario, username: usuario.username, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // Caduca en 8 horas
        );

        // Devolvemos los datos y el token al frontend
        res.json({ 
            mensaje: 'Inicio de sesión exitoso', 
            username: usuario.username,
            rol: usuario.rol,
            token: token // <-- Aquí enviamos el token
        });
    });
};

module.exports = { login };