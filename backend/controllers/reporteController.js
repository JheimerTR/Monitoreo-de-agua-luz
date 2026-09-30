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

// =====================================================
// ESTADÍSTICAS PARA LOS GRÁFICOS DEL PANEL Y REPORTES
// "lectura" = consumo del mes (m³ para Agua, kWh para Luz)
// El "mes actual" es el último mes que tiene registros.
// =====================================================
const obtenerEstadisticas = async (req, res) => {
    const pdb = db.promise();
    try {
        const [[{ mes_actual }]] = await pdb.query(
            "SELECT DATE_FORMAT(MAX(fecha_facturacion), '%Y-%m-01') AS mes_actual FROM Consumos"
        );

        if (!mes_actual) {
            return res.json({ mesActual: null, mesAnterior: null, kpis: null, mensual: [], porDepartamento: [], categorias: [], comparativo: [] });
        }

        const [[{ mes_anterior }]] = await pdb.query(
            "SELECT DATE_FORMAT(DATE_SUB(?, INTERVAL 1 MONTH), '%Y-%m-01') AS mes_anterior",
            [mes_actual]
        );

        // 1. KPIs del mes actual
        const [[kpis]] = await pdb.query(`
            SELECT
                COALESCE(SUM(CASE WHEN c.servicio = 'Agua' THEN c.lectura END), 0) AS total_agua,
                COALESCE(SUM(CASE WHEN c.servicio = 'Luz'  THEN c.lectura END), 0) AS total_luz,
                COALESCE(SUM(c.lectura * u.tarifa_por_unidad), 0)                 AS costo_total,
                COALESCE(SUM(c.diferencia_porcentual > 25), 0)                    AS alertas
            FROM Consumos c
            JOIN Configuracion_Umbrales u ON u.servicio = c.servicio
            WHERE c.fecha_facturacion >= ? AND c.fecha_facturacion < DATE_ADD(?, INTERVAL 1 MONTH)
        `, [mes_actual, mes_actual]);

        const [[kpisAnt]] = await pdb.query(`
            SELECT
                COALESCE(SUM(CASE WHEN c.servicio = 'Agua' THEN c.lectura END), 0) AS total_agua,
                COALESCE(SUM(CASE WHEN c.servicio = 'Luz'  THEN c.lectura END), 0) AS total_luz,
                COALESCE(SUM(c.lectura * u.tarifa_por_unidad), 0)                 AS costo_total
            FROM Consumos c
            JOIN Configuracion_Umbrales u ON u.servicio = c.servicio
            WHERE c.fecha_facturacion >= ? AND c.fecha_facturacion < DATE_ADD(?, INTERVAL 1 MONTH)
        `, [mes_anterior, mes_anterior]);

        // 2. Evolución mensual (últimos 12 meses): consumo y costo por servicio
        const [mensual] = await pdb.query(`
            SELECT
                DATE_FORMAT(c.fecha_facturacion, '%Y-%m') AS mes,
                SUM(CASE WHEN c.servicio = 'Agua' THEN c.lectura ELSE 0 END)                       AS agua,
                SUM(CASE WHEN c.servicio = 'Luz'  THEN c.lectura ELSE 0 END)                       AS luz,
                SUM(CASE WHEN c.servicio = 'Agua' THEN c.lectura * u.tarifa_por_unidad ELSE 0 END) AS costo_agua,
                SUM(CASE WHEN c.servicio = 'Luz'  THEN c.lectura * u.tarifa_por_unidad ELSE 0 END) AS costo_luz
            FROM Consumos c
            JOIN Configuracion_Umbrales u ON u.servicio = c.servicio
            WHERE c.fecha_facturacion >= DATE_SUB(?, INTERVAL 11 MONTH)
              AND c.fecha_facturacion <  DATE_ADD(?, INTERVAL 1 MONTH)
            GROUP BY mes
            ORDER BY mes
        `, [mes_actual, mes_actual]);

        // 3. Consumo por departamento en el mes actual
        const [porDepartamento] = await pdb.query(`
            SELECT
                d.nombre AS departamento,
                SUM(CASE WHEN c.servicio = 'Agua' THEN c.lectura ELSE 0 END) AS agua,
                SUM(CASE WHEN c.servicio = 'Luz'  THEN c.lectura ELSE 0 END) AS luz
            FROM Consumos c
            JOIN Departamentos d ON d.id_departamento = c.id_departamento
            WHERE c.fecha_facturacion >= ? AND c.fecha_facturacion < DATE_ADD(?, INTERVAL 1 MONTH)
              AND d.tipo <> 'Área común'
            GROUP BY d.id_departamento, d.nombre
            ORDER BY d.nombre
        `, [mes_actual, mes_actual]);

        // 4. Distribución por categoría (últimos 12 meses)
        const [categorias] = await pdb.query(`
            SELECT c.categoria, c.servicio, COUNT(*) AS cantidad
            FROM Consumos c
            JOIN Departamentos d ON d.id_departamento = c.id_departamento
            WHERE d.tipo <> 'Área común'
              AND c.fecha_facturacion >= DATE_SUB(?, INTERVAL 11 MONTH)
              AND c.fecha_facturacion <  DATE_ADD(?, INTERVAL 1 MONTH)
            GROUP BY c.categoria, c.servicio
        `, [mes_actual, mes_actual]);

        // 5. Mes actual vs mes anterior por departamento y servicio
        const [comparativo] = await pdb.query(`
            SELECT
                d.nombre AS departamento,
                c.servicio,
                SUM(CASE WHEN c.fecha_facturacion >= ? THEN c.lectura ELSE 0 END) AS actual,
                SUM(CASE WHEN c.fecha_facturacion <  ? THEN c.lectura ELSE 0 END) AS anterior
            FROM Consumos c
            JOIN Departamentos d ON d.id_departamento = c.id_departamento
            WHERE c.fecha_facturacion >= ? AND c.fecha_facturacion < DATE_ADD(?, INTERVAL 1 MONTH)
            GROUP BY d.id_departamento, d.nombre, c.servicio
            ORDER BY d.nombre, c.servicio
        `, [mes_actual, mes_actual, mes_anterior, mes_actual]);

        // 6. Áreas comunes: consumo y costo del mes actual por área
        const [areas] = await pdb.query(`
            SELECT
                d.nombre AS area,
                d.descripcion,
                SUM(CASE WHEN c.servicio = 'Agua' THEN c.lectura ELSE 0 END)                       AS agua,
                SUM(CASE WHEN c.servicio = 'Luz'  THEN c.lectura ELSE 0 END)                       AS luz,
                SUM(CASE WHEN c.servicio = 'Agua' THEN c.lectura * u.tarifa_por_unidad ELSE 0 END) AS costo_agua,
                SUM(CASE WHEN c.servicio = 'Luz'  THEN c.lectura * u.tarifa_por_unidad ELSE 0 END) AS costo_luz
            FROM Consumos c
            JOIN Departamentos d ON d.id_departamento = c.id_departamento
            JOIN Configuracion_Umbrales u ON u.servicio = c.servicio
            WHERE d.tipo = 'Área común'
              AND c.fecha_facturacion >= ? AND c.fecha_facturacion < DATE_ADD(?, INTERVAL 1 MONTH)
            GROUP BY d.id_departamento, d.nombre, d.descripcion
            ORDER BY SUM(c.lectura * u.tarifa_por_unidad) DESC
        `, [mes_actual, mes_actual]);

        // 7. Costo del mes por tipo de unidad (Departamento / Local / Área común)
        const [porTipo] = await pdb.query(`
            SELECT d.tipo, SUM(c.lectura * u.tarifa_por_unidad) AS costo
            FROM Consumos c
            JOIN Departamentos d ON d.id_departamento = c.id_departamento
            JOIN Configuracion_Umbrales u ON u.servicio = c.servicio
            WHERE c.fecha_facturacion >= ? AND c.fecha_facturacion < DATE_ADD(?, INTERVAL 1 MONTH)
            GROUP BY d.tipo
        `, [mes_actual, mes_actual]);

        // 8. Unidades privadas activas entre las que se reparte el costo de las áreas comunes
        const [[{ unidades }]] = await pdb.query(
            "SELECT COUNT(*) AS unidades FROM Departamentos WHERE estado = 'Activo' AND tipo <> 'Área común'"
        );

        // 9. Costo mensual de las áreas comunes (últimos 12 meses)
        const [mensualAreas] = await pdb.query(`
            SELECT DATE_FORMAT(c.fecha_facturacion, '%Y-%m') AS mes,
                   SUM(c.lectura * u.tarifa_por_unidad) AS costo
            FROM Consumos c
            JOIN Departamentos d ON d.id_departamento = c.id_departamento
            JOIN Configuracion_Umbrales u ON u.servicio = c.servicio
            WHERE d.tipo = 'Área común'
              AND c.fecha_facturacion >= DATE_SUB(?, INTERVAL 11 MONTH)
              AND c.fecha_facturacion <  DATE_ADD(?, INTERVAL 1 MONTH)
            GROUP BY mes
            ORDER BY mes
        `, [mes_actual, mes_actual]);

        const num = (v) => Number(v) || 0;

        const areasComunes = areas.map(a => ({
            area: a.area,
            descripcion: a.descripcion,
            agua: num(a.agua),
            luz: num(a.luz),
            costoAgua: num(a.costo_agua),
            costoLuz: num(a.costo_luz),
            costo: num(a.costo_agua) + num(a.costo_luz)
        }));
        const costoAreas = areasComunes.reduce((s, a) => s + a.costo, 0);
        const costoEdificio = porTipo.reduce((s, t) => s + num(t.costo), 0);
        const nUnidades = num(unidades);

        res.json({
            mesActual: mes_actual.slice(0, 7),
            mesAnterior: mes_anterior.slice(0, 7),
            kpis: {
                totalAgua: num(kpis.total_agua),
                totalLuz: num(kpis.total_luz),
                costoTotal: num(kpis.costo_total),
                alertas: num(kpis.alertas),
                anterior: {
                    totalAgua: num(kpisAnt.total_agua),
                    totalLuz: num(kpisAnt.total_luz),
                    costoTotal: num(kpisAnt.costo_total)
                }
            },
            mensual: mensual.map(m => ({
                mes: m.mes,
                agua: num(m.agua),
                luz: num(m.luz),
                costoAgua: num(m.costo_agua),
                costoLuz: num(m.costo_luz)
            })),
            porDepartamento: porDepartamento.map(d => ({
                departamento: d.departamento,
                agua: num(d.agua),
                luz: num(d.luz)
            })),
            categorias: categorias.map(c => ({
                categoria: c.categoria,
                servicio: c.servicio,
                cantidad: num(c.cantidad)
            })),
            comparativo: comparativo.map(c => {
                const actual = num(c.actual);
                const anterior = num(c.anterior);
                return {
                    departamento: c.departamento,
                    servicio: c.servicio,
                    actual,
                    anterior,
                    variacion: anterior > 0 ? ((actual - anterior) / anterior) * 100 : null
                };
            }),
            areasComunes: {
                areas: areasComunes,
                costoTotal: costoAreas,
                porcentajeDelEdificio: costoEdificio > 0 ? (costoAreas / costoEdificio) * 100 : 0,
                unidades: nUnidades,
                prorrateoPorUnidad: nUnidades > 0 ? costoAreas / nUnidades : 0,
                porTipo: porTipo.map(t => ({ tipo: t.tipo, costo: num(t.costo) })),
                mensual: mensualAreas.map(m => ({ mes: m.mes, costo: num(m.costo) }))
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { obtenerResumenGlobal, obtenerEstadisticas };
