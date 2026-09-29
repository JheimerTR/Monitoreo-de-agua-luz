import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Dashboard() {
    // Datos principales
    const [departamentos, setDepartamentos] = useState([]);
    const [historial, setHistorial] = useState([]); 
    
    // Estados para Búsqueda, Ordenamiento y Paginación
    const [busqueda, setBusqueda] = useState('');  
    const [orden, setOrden] = useState({ columna: 'fecha', direccion: 'desc' });
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 5; 

    // Estados del formulario
    const [idDepartamento, setIdDepartamento] = useState('');
    const [servicio, setServicio] = useState('Agua');
    const [lectura, setLectura] = useState('');
    const [fecha, setFecha] = useState('');
    
    // Alertas
    const [mensajeExito, setMensajeExito] = useState('');
    const [mensajeError, setMensajeError] = useState('');
    const [alerta, setAlerta] = useState(null);

    // Saber quién está conectado
    const usuarioActivo = localStorage.getItem('usuarioActivo');

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = () => {
        axios.get('https://monitoreo-de-agua-luz.onrender.com/api/departamentos')
            .then(res => setDepartamentos(res.data))
            .catch(err => console.error(err));
            
        axios.get('https://monitoreo-de-agua-luz.onrender.com/api/consumos')
            .then(res => setHistorial(res.data))
            .catch(err => console.error(err));
    };

    const registrarLectura = (e) => {
        e.preventDefault();
        setMensajeExito('');
        setMensajeError('');
        setAlerta(null);

        axios.post('https://monitoreo-de-agua-luz.onrender.com/api/consumos', {
            id_departamento: idDepartamento,
            servicio,
            lectura: parseFloat(lectura),
            fecha_facturacion: fecha
        })
        .then(res => {
            setMensajeExito(`${res.data.mensaje}Categoría: ${res.data.categoria}`);
            if (res.data.alerta) setAlerta(res.data.alerta);
            setLectura('');
            setFecha('');
            cargarDatos(); 
            setPaginaActual(1); 
        })
        .catch(err => {
            setMensajeError(err.response?.data?.error || 'Error al guardar');
        });
    };

    const editarConsumo = (item) => {
        const opcionesDeptos = departamentos.map(d => 
            `<option value="${d.id_departamento}" ${d.id_departamento === item.id_departamento ? 'selected' : ''}>${d.nombre}</option>`
        ).join('');

        Swal.fire({
            title: 'Modificar Registro',
            html: `
                <div class="text-start mt-3">
                    <label class="form-label small fw-bold text-muted">Departamento</label>
                    <select id="swal-depto" class="form-select mb-3">${opcionesDeptos}</select>

                    <label class="form-label small fw-bold text-muted">Servicio</label>
                    <select id="swal-servicio" class="form-select mb-3">
                        <option value="Agua" ${item.servicio === 'Agua' ? 'selected' : ''}>Agua</option>
                        <option value="Luz" ${item.servicio === 'Luz' ? 'selected' : ''}>Luz</option>
                    </select>

                    <label class="form-label small fw-bold text-muted">Lectura</label>
                    <input id="swal-lectura" type="number" step="0.01" min="0" onkeydown="return ['e','E','+','-'].includes(event.key) ? false : true" class="form-control mb-3" value="${item.lectura}">

                    <label class="form-label small fw-bold text-muted">Fecha</label>
                    <input id="swal-fecha" type="date" class="form-control" value="${item.fecha}">
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Guardar cambios',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                return {
                    id_departamento: document.getElementById('swal-depto').value,
                    servicio: document.getElementById('swal-servicio').value,
                    nueva_lectura: document.getElementById('swal-lectura').value,
                    fecha_facturacion: document.getElementById('swal-fecha').value,
                    usuario: usuarioActivo 
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                axios.put(`https://monitoreo-de-agua-luz.onrender.com/api/consumos/${item.id_consumo}`, result.value)
                    .then(res => {
                        Swal.fire('¡Actualizado!', res.data.mensaje, 'success');
                        cargarDatos(); 
                    })
                    .catch(err => Swal.fire('Error', err.response?.data?.error || 'No se pudo modificar', 'error'));
            }
        });
    };

    // --- LÓGICA DE TABLA: BUSCAR, ORDENAR Y PAGINAR ---
    const manejarBusqueda = (e) => {
        setBusqueda(e.target.value);
        setPaginaActual(1); 
    };

    const manejarOrden = (columna) => {
        const direccion = (orden.columna === columna && orden.direccion === 'asc') ? 'desc' : 'asc';
        setOrden({ columna, direccion });
    };

    const historialFiltrado = historial.filter(item => 
        item.departamento.toLowerCase().includes(busqueda.toLowerCase()) || 
        item.servicio.toLowerCase().includes(busqueda.toLowerCase())
    );

    const historialOrdenado = [...historialFiltrado].sort((a, b) => {
        let valA = a[orden.columna];
        let valB = b[orden.columna];

        if (['lectura', 'diferencia_absoluta', 'diferencia_porcentual'].includes(orden.columna)) {
            valA = parseFloat(valA);
            valB = parseFloat(valB);
        }

        if (valA < valB) return orden.direccion === 'asc' ? -1 : 1;
        if (valA > valB) return orden.direccion === 'asc' ? 1 : -1;
        return 0;
    });

    const indexUltimoItem = paginaActual * itemsPorPagina;
    const indexPrimerItem = indexUltimoItem - itemsPorPagina;
    const historialPaginado = historialOrdenado.slice(indexPrimerItem, indexUltimoItem); 
    const totalPaginas = Math.ceil(historialFiltrado.length / itemsPorPagina);

    return (
        <div>
            <h2 className="mb-4 fw-bold" style={{ color: '#1f2937' }}>Registro de Consumo</h2>
            
            {/* Alerta de Incremento Atípico */}
            {alerta && (
                <div className="alert alert-danger shadow-sm d-flex justify-content-between align-items-center" role="alert">
                    <span><strong>{alerta}</strong></span>
                    <button className="btn btn-sm btn-danger" onClick={() => setAlerta(null)}>Entendido</button>
                </div>
            )}

            <div className="card sombra-suave border-0 mb-5 p-2">
                <div className="card-body">
                    <form onSubmit={registrarLectura} className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label text-muted small fw-bold">Departamento</label>
                            <select className="form-select" value={idDepartamento} onChange={e => setIdDepartamento(e.target.value)} required>
                                <option value="">-- Seleccionar --</option>
                                {departamentos.filter(d => d.estado !== 'Inactivo').map(dep => (
                                    <option key={dep.id_departamento} value={dep.id_departamento}>{dep.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label text-muted small fw-bold">Servicio</label>
                            <select className="form-select" value={servicio} onChange={e => setServicio(e.target.value)} required>
                                <option value="Agua">Agua</option>
                                <option value="Luz">Luz</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label text-muted small fw-bold">Lectura Actual</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                min="0"
                                className="form-control" 
                                placeholder="Ej. 120.50" 
                                value={lectura} 
                                onChange={e => setLectura(e.target.value)} 
                                onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                required 
                            /> </div>
                        <div className="col-md-2">
                            <label className="form-label text-muted small fw-bold">Fecha</label>
                            <input type="date" className="form-control" value={fecha} onChange={e => setFecha(e.target.value)} required />
                        </div>
                        <div className="col-md-2">
                            <button type="submit" className="btn btn-warning w-100 fw-bold text-dark">Registrar</button>
                        </div>
                    </form>
                    
                    {/* ALERTAS BONITAS */}
                    {mensajeExito && <div className="alert alert-success mt-3 mb-0 fw-bold text-center">{mensajeExito}</div>}
                    {mensajeError && <div className="alert alert-danger mt-3 mb-0 fw-bold text-center">❌ {mensajeError}</div>}
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold m-0" style={{ color: '#1f2937' }}>Historial Reciente</h4>
                <input 
                    type="text" 
                    className="form-control w-25" 
                    placeholder="🔍 Buscar..." 
                    value={busqueda} 
                    onChange={manejarBusqueda}
                />
            </div>

            <div className="card sombra-suave border-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-muted">
                            {/* TÍTULOS INTERACTIVOS PARA ORDENAR */}
                            <tr>
                                <th onClick={() => manejarOrden('fecha')} style={{cursor: 'pointer'}} className="user-select-none">
                                    Fecha {orden.columna === 'fecha' && (orden.direccion === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => manejarOrden('departamento')} style={{cursor: 'pointer'}} className="user-select-none">
                                    Depto {orden.columna === 'departamento' && (orden.direccion === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => manejarOrden('servicio')} style={{cursor: 'pointer'}} className="user-select-none">
                                    Servicio {orden.columna === 'servicio' && (orden.direccion === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => manejarOrden('lectura')} style={{cursor: 'pointer'}} className="user-select-none">
                                    Lectura {orden.columna === 'lectura' && (orden.direccion === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => manejarOrden('diferencia_absoluta')} style={{cursor: 'pointer'}} className="user-select-none">
                                    Var. Absoluta {orden.columna === 'diferencia_absoluta' && (orden.direccion === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => manejarOrden('diferencia_porcentual')} style={{cursor: 'pointer'}} className="user-select-none">
                                    Var. % {orden.columna === 'diferencia_porcentual' && (orden.direccion === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => manejarOrden('categoria')} style={{cursor: 'pointer'}} className="user-select-none">
                                    Categoría {orden.columna === 'categoria' && (orden.direccion === 'asc' ? '↑' : '↓')}
                                </th>
                                {usuarioActivo === 'admin' && <th className="text-end">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {historialPaginado.length > 0 ? (
                                historialPaginado.map(item => (
                                    <tr key={item.id_consumo}>
                                        <td>{item.fecha}</td>
                                        <td className="fw-bold">{item.departamento}</td>
                                        <td>
                                            <span className={`badge ${item.servicio === 'Agua' ? 'bg-info' : 'bg-warning text-dark'}`}>
                                                {item.servicio}
                                            </span>
                                        </td>
                                        <td>{item.lectura}</td>
                                        <td className={item.diferencia_absoluta > 0 ? 'text-danger' : 'text-success'}>
                                            {item.diferencia_absoluta > 0 ? '+' : ''}{item.diferencia_absoluta}
                                        </td>
                                        <td className={item.diferencia_porcentual > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                                            {item.diferencia_porcentual}%
                                        </td>
                                        <td>{item.categoria}</td>
                                        
                                        {usuarioActivo === 'admin' && (
                                            <td className="text-end">
                                               <button 
                                                    onClick={() => editarConsumo(item)} 
                                                    className="btn btn-sm btn-outline-primary fw-bold">
                                                    ✏️ Editar
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-muted">No se encontraron registros</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {totalPaginas > 1 && (
                <div className="d-flex justify-content-end align-items-center mt-3 gap-3">
                    <button className="btn btn-outline-secondary btn-sm" disabled={paginaActual === 1} onClick={() => setPaginaActual(paginaActual - 1)}>
                        Anterior
                    </button>
                    <span className="small text-muted">Página <strong>{paginaActual}</strong> de {totalPaginas}</span>
                    <button className="btn btn-outline-secondary btn-sm" disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(paginaActual + 1)}>
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
}