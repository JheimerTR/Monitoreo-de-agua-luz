const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Debe ingresar usuario y contraseña' });
    }

    db.query("SELECT * FROM Usuarios WHERE username = ?", [username], (err, results) => {
        if (err) { console.error(err); return res.status(500).json({ error: 'Error interno del servidor' }); }
        if (results.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

        const usuario = results[0];

        // Usuarios inactivados por el administrador no pueden ingresar (CU30)
        if (usuario.estado !== 'Activo') return res.status(403).json({ error: 'Cuenta inactiva. Contacte al administrador.' });

        // Si el bloqueo ya expiró, el contador vuelve a cero (CU28 - 4A)
        if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) <= new Date()) usuario.intentos_fallidos = 0;

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

        db.query("UPDATE Usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id_usuario = ?", [usuario.id_usuario]);
        const token = jwt.sign(
            { id: usuario.id_usuario, username: usuario.username, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.json({ mensaje: 'Inicio de sesión exitoso', username: usuario.username, rol: usuario.rol, token });
    });
};

module.exports = { login };