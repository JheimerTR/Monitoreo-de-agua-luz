const db = require('../config/db');
const bcrypt = require('bcrypt');

const obtenerUsuarios = (req, res) => {
    // No devolvemos las contraseñas por seguridad
    db.query("SELECT id_usuario, username, rol, estado, intentos_fallidos FROM Usuarios ORDER BY rol ASC, username ASC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

const registrarUsuario = async (req, res) => {
    const { username, password, rol } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
    }
    
    try {
        // Encriptamos la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const password_encriptada = await bcrypt.hash(password, salt);

        db.query(
            "INSERT INTO Usuarios (username, password_hash, rol, estado, intentos_fallidos) VALUES (?, ?, ?, 'Activo', 0)",
            [username, password_encriptada, rol || 'operador'],
            (err, results) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'El nombre de usuario ya existe' });
                    return res.status(500).json({ error: err.message });
                }
                res.json({ mensaje: 'Usuario registrado exitosamente' });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la contraseña' });
    }
};


const cambiarEstado = (req, res) => {
    const { id } = req.params;
    db.query(
        "UPDATE Usuarios SET estado = IF(estado = 'Activo', 'Inactivo', 'Activo') WHERE id_usuario = ?",
        [id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ mensaje: 'Estado de acceso actualizado' });
        }
    );
};

const desbloquearUsuario = (req, res) => {
    const { id } = req.params;
    db.query(
        "UPDATE Usuarios SET intentos_fallidos = 0 WHERE id_usuario = ?", 
        [id], 
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ mensaje: 'Cuenta desbloqueada correctamente' });
        }
    );
};

module.exports = { obtenerUsuarios, registrarUsuario, cambiarEstado, desbloquearUsuario };