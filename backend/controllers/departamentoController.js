const db = require('../config/db');

const obtenerDepartamentos = (req, res) => {
    // Ordenamos para que los Activos salgan primero
    db.query("SELECT * FROM Departamentos ORDER BY estado ASC, nombre ASC", (err, results) => {
        if (err) { console.error(err); return res.status(500).json({ error: 'Error interno del servidor' }); }
        res.json(results);
    });
};

const registrarDepartamento = (req, res) => {
    const { nombre, descripcion } = req.body;
    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El nombre del departamento es requerido' });
    }
    if (nombre.length > 50 || /[<>]/.test(nombre) || (descripcion && (descripcion.length > 255 || /[<>]/.test(descripcion)))) {
        return res.status(400).json({ error: 'Nombre o descripción con caracteres o longitud no permitidos' });
    }
    db.query(
        "INSERT INTO Departamentos (nombre, descripcion, estado) VALUES (?, ?, 'Activo')",
        [nombre, descripcion],
        (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'El departamento ya está registrado' });
                { console.error(err); return res.status(500).json({ error: 'Error interno del servidor' }); }
            }
            res.json({ id: results.insertId, mensaje: 'Departamento creado exitosamente' });
        }
    );
};

// NUEVA LÓGICA: Alternar entre Activo e Inactivo
const cambiarEstado = (req, res) => {
    const { id } = req.params;
    db.query(
        "UPDATE Departamentos SET estado = IF(estado = 'Activo', 'Inactivo', 'Activo') WHERE id_departamento = ?", 
        [id], 
        (err, results) => {
            if (err) { console.error(err); return res.status(500).json({ error: 'Error interno del servidor' }); }
            res.json({ mensaje: 'Estado del departamento actualizado' });
        }
    );
};

module.exports = { obtenerDepartamentos, registrarDepartamento, cambiarEstado };