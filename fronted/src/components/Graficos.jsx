import { useState } from 'react';
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

import { COLORES, fmt, fmtBs, nombreMes } from './estadisticas';

function Tarjeta({ titulo, children, className = '' }) {
    return (
        <div className={`card sombra-suave border-0 h-100 ${className}`}>
            <div className="card-body">
                <h6 className="fw-bold text-secondary mb-3">{titulo}</h6>
                {children}
            </div>
        </div>
    );
}

function SinDatos() {
    return <div className="text-center text-muted py-5">No hay datos suficientes</div>;
}

// Variación % contra el mes anterior (verde si baja, rojo si sube)
function Variacion({ actual, anterior }) {
    if (!anterior) return <small className="text-muted">sin mes anterior</small>;
    const v = ((actual - anterior) / anterior) * 100;
    const sube = v > 0;
    return (
        <small className={sube ? 'text-danger fw-bold' : 'text-success fw-bold'}>
            {sube ? '▲' : '▼'} {fmt(Math.abs(v))}% vs mes anterior
        </small>
    );
}

// ---------- 1. TARJETAS KPI ----------
export function TarjetasKPI({ datos }) {
    if (!datos?.kpis) return null;
    const { kpis, mesActual } = datos;
    const items = [
        { titulo: '💧 Agua', valor: `${fmt(kpis.totalAgua)} m³`, act: kpis.totalAgua, ant: kpis.anterior.totalAgua, color: COLORES.agua },
        { titulo: '⚡ Luz', valor: `${fmt(kpis.totalLuz)} kWh`, act: kpis.totalLuz, ant: kpis.anterior.totalLuz, color: COLORES.luz },
        { titulo: '💰 Costo estimado', valor: fmtBs(kpis.costoTotal), act: kpis.costoTotal, ant: kpis.anterior.costoTotal, color: '#6366f1' },
    ];

    return (
        <>
            <p className="text-muted small mb-2">Resumen de <strong>{nombreMes(mesActual)}</strong></p>
            <div className="row g-3 mb-4">
                {items.map(it => (
                    <div className="col-6 col-lg-3" key={it.titulo}>
                        <div className="card sombra-suave border-0 h-100" style={{ borderLeft: `4px solid ${it.color}` }}>
                            <div className="card-body">
                                <div className="text-muted small fw-bold">{it.titulo}</div>
                                <div className="fs-4 fw-bold" style={{ color: '#1f2937' }}>{it.valor}</div>
                                <Variacion actual={it.act} anterior={it.ant} />
                            </div>
                        </div>
                    </div>
                ))}
                <div className="col-6 col-lg-3">
                    <div className="card sombra-suave border-0 h-100" style={{ borderLeft: `4px solid ${COLORES.EXCESIVO}` }}>
                        <div className="card-body">
                            <div className="text-muted small fw-bold">🚨 Alertas del mes</div>
                            <div className="fs-4 fw-bold" style={{ color: kpis.alertas > 0 ? COLORES.EXCESIVO : '#1f2937' }}>{kpis.alertas}</div>
                            <small className="text-muted">incrementos mayores al 25%</small>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// ---------- 2. LÍNEA MENSUAL (dos ejes: m³ y kWh) ----------
export function GraficoMensual({ datos }) {
    const data = (datos?.mensual || []).map(m => ({ ...m, etiqueta: nombreMes(m.mes) }));
    return (
        <Tarjeta titulo="Evolución mensual del consumo (últimos 12 meses)">
            {data.length === 0 ? <SinDatos /> : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="etiqueta" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="agua" tick={{ fontSize: 12 }} label={{ value: 'm³', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                        <YAxis yAxisId="luz" orientation="right" tick={{ fontSize: 12 }} label={{ value: 'kWh', angle: 90, position: 'insideRight', fontSize: 12 }} />
                        <Tooltip formatter={(v, n) => [fmt(v) + (n === 'Agua (m³)' ? ' m³' : ' kWh'), n]} />
                        <Legend />
                        <Line yAxisId="agua" type="monotone" dataKey="agua" name="Agua (m³)" stroke={COLORES.agua} strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line yAxisId="luz" type="monotone" dataKey="luz" name="Luz (kWh)" stroke={COLORES.luz} strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Tarjeta>
    );
}

// ---------- 3. BARRAS POR DEPARTAMENTO ----------
export function GraficoPorDepartamento({ datos }) {
    // Etiquetas cortas para que entren 20 departamentos: "Apto 101" -> "101", "Local Comercial 1" -> "Local 1"
    const data = (datos?.porDepartamento || []).map(d => ({
        ...d,
        corto: d.departamento.replace(/^Apto\s*/i, '').replace(/^Local Comercial/i, 'Local')
    }));
    return (
        <Tarjeta titulo={`Consumo por departamento — ${nombreMes(datos?.mesActual)}`}>
            {data.length === 0 ? <SinDatos /> : (
                <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }} barCategoryGap="15%">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="corto" tick={{ fontSize: 11 }} interval={0} angle={-45} textAnchor="end" height={50} />
                        <YAxis yAxisId="agua" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="luz" orientation="right" tick={{ fontSize: 12 }} />
                        <Tooltip labelFormatter={(_, p) => p?.[0]?.payload?.departamento} formatter={(v, n) => [fmt(v) + (n === 'Agua (m³)' ? ' m³' : ' kWh'), n]} />
                        <Legend />
                        <Bar yAxisId="agua" dataKey="agua" name="Agua (m³)" fill={COLORES.agua} radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="luz" dataKey="luz" name="Luz (kWh)" fill={COLORES.luz} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Tarjeta>
    );
}

// ---------- 4. DONA POR CATEGORÍA ----------
export function GraficoCategorias({ datos }) {
    const [servicio, setServicio] = useState('Todos');
    const filtradas = (datos?.categorias || []).filter(c => servicio === 'Todos' || c.servicio === servicio);

    const agrupado = {};
    filtradas.forEach(c => { agrupado[c.categoria] = (agrupado[c.categoria] || 0) + c.cantidad; });
    const orden = ['ÓPTIMO', 'REGULAR', 'EXCESIVO', 'NO CLASIFICADO'];
    const data = orden.filter(k => agrupado[k]).map(k => ({ name: k, value: agrupado[k] }));
    const total = data.reduce((s, d) => s + d.value, 0);
    const optimo = total ? Math.round(((agrupado['ÓPTIMO'] || 0) / total) * 100) : 0;

    return (
        <Tarjeta titulo="Consumo responsable (últimos 12 meses)">
            <div className="btn-group btn-group-sm mb-2" role="group">
                {['Todos', 'Agua', 'Luz'].map(s => (
                    <button key={s} type="button"
                        className={`btn ${servicio === s ? 'btn-dark' : 'btn-outline-secondary'}`}
                        onClick={() => setServicio(s)}>{s}</button>
                ))}
            </div>
            {total === 0 ? <SinDatos /> : (
                <div style={{ position: 'relative' }}>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={data} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={2}>
                                {data.map(d => <Cell key={d.name} fill={COLORES[d.name]} />)}
                            </Pie>
                            <Tooltip formatter={(v, n) => [`${v} registros (${Math.round(v / total * 100)}%)`, n]} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center" style={{ position: 'absolute', top: 'calc(50% - 30px)', left: 0, right: 0, pointerEvents: 'none' }}>
                        <div className="fs-4 fw-bold" style={{ color: COLORES['ÓPTIMO'] }}>{optimo}%</div>
                        <div className="small text-muted">óptimo</div>
                    </div>
                </div>
            )}
        </Tarjeta>
    );
}

// ---------- 5. COSTO MENSUAL APILADO ----------
export function GraficoCosto({ datos }) {
    const data = (datos?.mensual || []).map(m => ({ ...m, etiqueta: nombreMes(m.mes) }));
    return (
        <Tarjeta titulo="Costo estimado mensual (Bs)">
            {data.length === 0 ? <SinDatos /> : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="etiqueta" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v, n) => [fmtBs(v), n]} />
                        <Legend />
                        <Bar dataKey="costoAgua" name="Agua" stackId="costo" fill={COLORES.agua} />
                        <Bar dataKey="costoLuz" name="Luz" stackId="costo" fill={COLORES.luz} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Tarjeta>
    );
}

// ---------- 6. MES ACTUAL VS ANTERIOR (ahorro por departamento) ----------
const CONSEJOS = {
    Agua: 'Revisar fugas en grifos e inodoros y usar lavadora con carga completa.',
    Luz: 'Cambiar a focos LED y desconectar equipos en stand-by.'
};

export function ComparativoMensual({ datos }) {
    const [verTodos, setVerTodos] = useState(false);
    // Primero los mayores incrementos: son los que necesitan atención
    const todas = [...(datos?.comparativo || [])].sort((a, b) => (b.variacion ?? -Infinity) - (a.variacion ?? -Infinity));
    const filas = verTodos ? todas : todas.slice(0, 8);
    return (
        <Tarjeta titulo={`Ahorro por departamento: ${nombreMes(datos?.mesActual)} vs ${nombreMes(datos?.mesAnterior)}`}>
            {todas.length === 0 ? <SinDatos /> : (
                <div className="table-responsive">
                    <table className="table align-middle mb-0" style={{ minWidth: 980 }}>
                        <thead className="table-light text-muted small">
                            <tr>
                                <th>Departamento</th>
                                <th>Servicio</th>
                                <th className="text-end">Anterior</th>
                                <th className="text-end">Actual</th>
                                <th style={{ width: '25%' }}>Variación</th>
                                <th>Recomendación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filas.map(f => {
                                const unidad = f.servicio === 'Agua' ? 'm³' : 'kWh';
                                const v = f.variacion;
                                const ahorra = v !== null && v <= 0;
                                const ancho = v === null ? 0 : Math.min(Math.abs(v), 100);
                                return (
                                    <tr key={`${f.departamento}-${f.servicio}`}>
                                        <td className="fw-bold">{f.departamento}</td>
                                        <td>
                                            <span className={`badge ${f.servicio === 'Agua' ? 'bg-info' : 'bg-warning text-dark'}`}>{f.servicio}</span>
                                        </td>
                                        <td className="text-end text-nowrap">{fmt(f.anterior)} {unidad}</td>
                                        <td className="text-end text-nowrap">{fmt(f.actual)} {unidad}</td>
                                        <td>
                                            {v === null ? <small className="text-muted">sin mes anterior</small> : (
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="flex-grow-1 bg-light rounded" style={{ height: 8 }}>
                                                        <div className="rounded" style={{ width: `${ancho}%`, height: 8, backgroundColor: ahorra ? COLORES['ÓPTIMO'] : COLORES.EXCESIVO }} />
                                                    </div>
                                                    <small className={`fw-bold ${ahorra ? 'text-success' : 'text-danger'}`} style={{ minWidth: 60 }}>
                                                        {v > 0 ? '+' : ''}{fmt(v)}%
                                                    </small>
                                                </div>
                                            )}
                                        </td>
                                        <td className="small" style={{ minWidth: 280 }}>
                                            {ahorra ? <span className="text-success">✅ ¡Buen ahorro!</span> : <span className="text-muted">💡 {CONSEJOS[f.servicio]}</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {todas.length > 8 && (
                        <div className="text-center mt-3">
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setVerTodos(!verTodos)}>
                                {verTodos ? 'Ver solo los 8 mayores incrementos' : `Ver todos (${todas.length})`}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </Tarjeta>
    );
}
