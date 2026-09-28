const db = require('../config/db');

const login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Debe ingresar usuario y contraseña' });
    }

    db.query("SELECT * FROM Usuarios WHERE username = ?", [username], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        // Si el usuario no existe
        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const usuario = results[0];

        // CU28: Verificar si la cuenta está bloqueada temporalmente
        if (usuario.bloqueado_hasta && new Date(usuario.bloqueado_hasta) > new Date()) {
            return res.status(403).json({ error: 'Cuenta bloqueada por múltiples intentos fallidos. Intente nuevamente en 15 minutos.' });
        }

        // Validar contraseña (Comparación directa para este entorno)
        if (password !== usuario.password_hash) {
            const nuevosIntentos = usuario.intentos_fallidos + 1;
            
            // Si alcanza los 3 intentos fallidos, bloquear la cuenta (RF13)
            if (nuevosIntentos >= 3) {
                db.query("UPDATE Usuarios SET intentos_fallidos = ?, bloqueado_hasta = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id_usuario = ?", [nuevosIntentos, usuario.id_usuario]);
                return res.status(403).json({ error: 'Cuenta bloqueada por múltiples intentos fallidos. Intente nuevamente en 15 minutos.' });
            } else {
                db.query("UPDATE Usuarios SET intentos_fallidos = ? WHERE id_usuario = ?", [nuevosIntentos, usuario.id_usuario]);
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
        }

        // Si el inicio de sesión es exitoso, reiniciar los intentos a 0
        db.query("UPDATE Usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id_usuario = ?", [usuario.id_usuario]);
        res.json({ mensaje: 'Inicio de sesión exitoso', username: usuario.username });
    });
};

// Endpoint temporal para crear un usuario Administrador por defecto
const crearAdmin = (req, res) => {
    db.query("INSERT IGNORE INTO Usuarios (username, password_hash) VALUES ('admin', '123456')", (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Usuario administrador creado. Credenciales -> Usuario: admin | Clave: 123456' });
    });
};

module.exports = { login, crearAdmin };