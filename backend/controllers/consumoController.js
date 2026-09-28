const db = require('../config/db');

const registrarConsumo = (req, res) => {
    const { id_departamento, servicio, lectura, fecha_facturacion } = req.body;

    if (!id_departamento || !servicio || !lectura || !fecha_facturacion) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (lectura < 0) {
        return res.status(400).json({ error: 'La lectura no puede ser negativa' });
    }

    // 1. Validar duplicados en el mismo mes
    db.query(
        "SELECT id_consumo FROM Consumos WHERE id_departamento = ? AND servicio = ? AND MONTH(fecha_facturacion) = MONTH(?) AND YEAR(fecha_facturacion) = YEAR(?)",
        [id_departamento, servicio, fecha_facturacion, fecha_facturacion],
        (err, duplicateResults) => {
            if (err) return res.status(500).json({ error: err.message });
            if (duplicateResults.length > 0) {
                return res.status(400).json({ error: `Error: Ya existe un registro de ${servicio} para este departamento en este mes.` });
            }

            // 2. Buscar consumo anterior
            db.query(
                "SELECT lectura FROM Consumos WHERE id_departamento = ? AND servicio = ? ORDER BY fecha_facturacion DESC LIMIT 1",
                [id_departamento, servicio],
                (err, prevResults) => {
                    if (err) return res.status(500).json({ error: err.message });

                    let lectura_anterior = prevResults.length > 0 ? parseFloat(prevResults[0].lectura) : 0;
                    let diferencia_absoluta = lectura_anterior > 0 ? (lectura - lectura_anterior) : lectura;
                    let diferencia_porcentual = lectura_anterior > 0 ? ((diferencia_absoluta / lectura_anterior) * 100) : 0;

                    // 3. Evaluar umbrales
                    db.query(
                        "SELECT limite_optimo, limite_regular FROM Configuracion_Umbrales WHERE servicio = ?",
                        [servicio],
                        (err, umbralResults) => {
                            if (err) return res.status(500).json({ error: err.message });

                            let categoria = 'NO CLASIFICADO';
                            if (umbralResults.length > 0) {
                                const { limite_optimo, limite_regular } = umbralResults[0];
                                if (lectura <= limite_optimo) categoria = 'ÓPTIMO';
                                else if (lectura <= limite_regular) categoria = 'REGULAR';
                                else categoria = 'EXCESIVO';
                            }

                            // 4. Guardar registro (YA NO BLOQUEAMOS POR 900%)
                            db.query(
                                "INSERT INTO Consumos (id_departamento, servicio, lectura, fecha_facturacion, diferencia_absoluta, diferencia_porcentual, categoria) VALUES (?, ?, ?, ?, ?, ?, ?)",
                                [id_departamento, servicio, lectura, fecha_facturacion, diferencia_absoluta, diferencia_porcentual, categoria],
                                (err, result) => {
                                    if (err) return res.status(500).json({ error: err.message });
                                    
                                    // 5. Generar Alertas Suaves
                                    let alerta = null;
                                    if (diferencia_porcentual > 900) {
                                        alerta = `¡ADVERTENCIA EXTREMA! Salto del ${diferencia_porcentual.toFixed(2)}%. Registro guardado, pero requiere verificación física del medidor.`;
                                    } else if (diferencia_porcentual > 25) { 
                                        alerta = `¡ALERTA! Incremento atípico del ${diferencia_porcentual.toFixed(2)}% detectado.`;
                                    }

                                    res.json({ mensaje: 'Consumo registrado exitosamente', categoria, alerta });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

const obtenerHistorial = (req, res) => {
    // NUEVO: Agregamos d.id_departamento a la consulta
    const query = `
        SELECT c.id_consumo, d.id_departamento, d.nombre AS departamento, c.servicio, c.lectura, DATE_FORMAT(c.fecha_facturacion, '%Y-%m-%d') as fecha, c.diferencia_absoluta, c.diferencia_porcentual, c.categoria
        FROM Consumos c
        JOIN Departamentos d ON c.id_departamento = d.id_departamento
        ORDER BY c.fecha_facturacion DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

const modificarConsumo = (req, res) => {
    const { id } = req.params;
    // NUEVO: Ahora también recibimos el campo 'usuario' desde React
    const { id_departamento, servicio, nueva_lectura, fecha_facturacion, usuario } = req.body;

    // 🔒 BARRERA DE SEGURIDAD DE DOBLE FONDO
    if (usuario !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado: Operación exclusiva para Súper Administradores.' });
    }

    if (nueva_lectura < 0) return res.status(400).json({ error: 'La lectura no puede ser negativa' });

    db.query(
        "UPDATE Consumos SET id_departamento = ?, servicio = ?, lectura = ?, fecha_facturacion = ? WHERE id_consumo = ?", 
        [id_departamento, servicio, nueva_lectura, fecha_facturacion, id], 
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ mensaje: 'Registro modificado exitosamente.' });
        }
    );
};


// Quitamos eliminarConsumo y ponemos modificarConsumo
module.exports = { registrarConsumo, obtenerHistorial, modificarConsumo };