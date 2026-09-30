import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Reportes() {
    const [resumen, setResumen] = useState([]);
    const [mayorConsumo, setMayorConsumo] = useState(null);
    const [menorConsumo, setMenorConsumo] = useState(null);

    useEffect(() => {
        cargarReportes();
    }, []);

    const cargarReportes = () => {
        axios.get('https://monitoreo-de-agua-luz.onrender.com/api/consumos')
            .then(res => {
                const consumos = res.data;
                
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
                    // AHORA SÍ: Sumamos directamente las lecturas
                    agrupado[clave].consumoTotal += parseFloat(item.lectura || 0);
                });

                const arrayResumen = Object.values(agrupado);
                setResumen(arrayResumen);

                if (arrayResumen.length > 0) {
                    const max = Math.max(...arrayResumen.map(i => i.consumoTotal));
                    const min = Math.min(...arrayResumen.map(i => i.consumoTotal));
                    setMayorConsumo(max);
                    setMenorConsumo(min);
                }
            })
            .catch(err => console.error("Error al cargar reportes:", err));
    };

    // Preparamos los datos para que el gráfico los entienda fácil
    const datosGrafico = resumen.map(item => ({
        nombre: `${item.departamento} (${item.servicio})`,
        Consumo: parseFloat(item.consumoTotal.toFixed(2)),
        fill: item.servicio === 'Agua' ? '#0dcaf0' : '#ffc107' // Celeste para agua, amarillo para luz
    }));

    return (
        <div>
            <h2 className="mb-4 fw-bold" style={{ color: '#1f2937' }}>Reportes y Estadísticas</h2>
            
            {/* NUEVA SECCIÓN: Gráfico de Barras */}
            {resumen.length > 0 && (
                <div className="card sombra-suave border-0 mb-4 p-3">
                    <div className="card-body">
                        <h5 className="fw-bold mb-4 text-secondary">Gráfico de Consumo Acumulado</h5>
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={datosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                                    <XAxis dataKey="nombre" />
                                    <YAxis />
                                    <Tooltip cursor={{fill: '#f8f9fa'}} />
                                    <Legend />
                                    <Bar dataKey="Consumo" name="Total Acumulado" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            <div className="card sombra-suave border-0 mb-4 p-3">
                <div className="card-body">
                    <h5 className="fw-bold mb-4 text-secondary">Tabla de Detalles Globales</h5>
                    
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
                                {(resumen || []).length > 0 ? (
                                    resumen.map((item, index) => {
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
                                                    {item.consumoTotal.toFixed(2)}
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

                    <div className="d-flex mt-4 gap-3">
                        <span className="badge bg-danger py-2 px-3">Mayor Consumo Histórico</span>
                        <span className="badge bg-success py-2 px-3">Menor Consumo Histórico</span>
                    </div>
                </div>
            </div>
        </div>
    );
}