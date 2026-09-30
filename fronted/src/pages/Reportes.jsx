import { useState, useEffect } from 'react';
import api from '../api';
import { GraficoPorDepartamento, GraficoCategorias, GraficoCosto, ComparativoMensual, ResumenAreasComunes, GraficoAreasComunes, GraficoDistribucionTipo } from '../components/Graficos';
import { useEstadisticas } from '../components/estadisticas';

export default function Reportes() {
    const [resumen, setResumen] = useState([]);
    const [mayorConsumo, setMayorConsumo] = useState(null);
    const [menorConsumo, setMenorConsumo] = useState(null);
    const { datos: estadisticas, error: errorEstadisticas } = useEstadisticas();

    useEffect(() => {
        cargarReportes();
    }, []);

    const cargarReportes = () => {
        // Usamos la ruta de historial que ya existe para calcular los totales
        api.get('/consumos')
            .then(res => {
                const consumos = res.data;
                
                // Agrupar y sumar los consumos por departamento y servicio (CU24)
                const agrupado = {};
                consumos.forEach(item => {
                    const clave = `${item.departamento}-${item.servicio}`;
                    if (!agrupado[clave]) {
                        agrupado[clave] = {
                            departamento: item.departamento,
                            servicio: item.servicio,
                            consumoTotal: 0
                        };
                    }
                    // Sumamos el consumo del mes (lectura) al total
                    agrupado[clave].consumoTotal += parseFloat(item.lectura || 0);
                });

                const arrayResumen = Object.values(agrupado);
                setResumen(arrayResumen);

                // Calcular automáticamente el mayor y menor (CU25)
                if (arrayResumen.length > 0) {
                    const max = Math.max(...arrayResumen.map(i => i.consumoTotal));
                    const min = Math.min(...arrayResumen.map(i => i.consumoTotal));
                    setMayorConsumo(max);
                    setMenorConsumo(min);
                }
            })
            .catch(err => console.error("Error al cargar reportes:", err));
    };

    return (
        <div>
            <h2 className="mb-4 fw-bold" style={{ color: '#1f2937' }}>Reportes y Estadísticas</h2>

            {errorEstadisticas && <div className="alert alert-danger">{errorEstadisticas}</div>}

            {/* GRÁFICOS */}
            <div className="row g-4 mb-4">
                <div className="col-lg-8">
                    <GraficoPorDepartamento datos={estadisticas} />
                </div>
                <div className="col-lg-4">
                    <GraficoCategorias datos={estadisticas} />
                </div>
                <div className="col-12">
                    <GraficoCosto datos={estadisticas} />
                </div>
                <div className="col-12">
                    <ComparativoMensual datos={estadisticas} />
                </div>
            </div>

            {/* ÁREAS COMUNES */}
            <h4 className="fw-bold mt-5 mb-3" style={{ color: '#1f2937' }}>
                <i className="bi bi-tree me-2 text-success"></i>Áreas comunes
            </h4>
            <ResumenAreasComunes datos={estadisticas} />
            <div className="row g-4 mb-5">
                <div className="col-lg-8">
                    <GraficoAreasComunes datos={estadisticas} />
                </div>
                <div className="col-lg-4">
                    <GraficoDistribucionTipo datos={estadisticas} />
                </div>
            </div>
            
            <div className="card sombra-suave border-0 mb-4 p-3">
                <div className="card-body">
                    <h5 className="fw-bold mb-4 text-secondary">Resumen Global del Edificio</h5>
                    
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light text-muted">
                                <tr>
                                    <th>Departamento</th>
                                    <th>Servicio</th>
                                    <th>Consumo Total Acumulado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Usamos (resumen || []) por seguridad para evitar pantallas en blanco */}
                                {(resumen || []).length > 0 ? (
                                    resumen.map((item, index) => {
                                        // Lógica para resaltar el mayor y menor consumo
                                        let colorClase = "";
                                        if (item.consumoTotal === mayorConsumo && mayorConsumo > 0) colorClase = "table-danger";
                                        else if (item.consumoTotal === menorConsumo && menorConsumo >= 0 && resumen.length > 1) colorClase = "table-success";

                                        return (
                                            <tr key={index} className={colorClase}>
                                                <td className="fw-bold">{item.departamento}</td>
                                                <td>
                                                    <span className={`badge ${item.servicio === 'Agua' ? 'bg-info' : 'bg-warning text-dark'}`}>
                                                        {item.servicio}
                                                    </span>
                                                </td>
                                                <td className="fw-bold">
                                                    {item.consumoTotal.toFixed(2)} {item.servicio === 'Agua' ? 'm³' : 'kWh'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-4 text-muted">No hay datos suficientes para generar el reporte</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Leyenda de colores estilo Badges */}
                    <div className="d-flex mt-4 gap-3">
                        <span className="badge bg-danger py-2 px-3">Mayor Consumo Histórico</span>
                        <span className="badge bg-success py-2 px-3">Menor Consumo Histórico</span>
                    </div>
                </div>
            </div>
        </div>
    );
}