const db = require('../config/db');

const obtenerResumenGlobal = (req, res) => {
    // Calculamos el consumo total por departamento sumando la diferencia absoluta
    const query = `
        SELECT 
            d.nombre AS departamento,
            c.servicio,
            SUM(c.diferencia_absoluta) AS consumo_total
        FROM Consumos c
        JOIN Departamentos d ON c.id_departamento = d.id_departamento
        GROUP BY d.id_departamento, c.servicio
        ORDER BY consumo_total DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) { console.error(err); return res.status(500).json({ error: 'Error interno del servidor' }); }
        res.json(results);
    });
};

module.exports = { obtenerResumenGlobal };