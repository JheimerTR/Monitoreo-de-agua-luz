import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Departamentos() {
    const [departamentos, setDepartamentos] = useState([]);
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [mensaje, setMensaje] = useState('');

    // Estados para Búsqueda y Paginación
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 5;

    useEffect(() => {
        cargarDepartamentos();
    }, []);

    const cargarDepartamentos = () => {
        axios.get('https://monitoreo-de-agua-luz.onrender.com/api/departamentos')
            .then(res => setDepartamentos(res.data))
            .catch(err => console.error(err));
    };

    const registrar = (e) => {
        e.preventDefault();
        setMensaje('');
        axios.post('https://monitoreo-de-agua-luz.onrender.com/api/departamentos', { nombre, descripcion })
            .then(res => {
                setMensaje(res.data.mensaje);
                setNombre('');
                setDescripcion('');
                cargarDepartamentos();
            })
            .catch(err => setMensaje(err.response?.data?.error || 'Error al guardar'));
    };

    const toggleEstado = (id, estadoActual) => {
        const accion = estadoActual === 'Activo' ? 'inactivar' : 'reactivar';
        const colorBoton = estadoActual === 'Activo' ? '#dc3545' : '#198754';

        Swal.fire({
            title: '¿Estás seguro?',
            text: `El departamento pasará a estado ${estadoActual === 'Activo' ? 'Inactivo' : 'Activo'}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: colorBoton,
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                axios.put(`https://monitoreo-de-agua-luz.onrender.com/api/departamentos/${id}/estado`)
                    .then(res => {
                        Swal.fire('¡Actualizado!', res.data.mensaje, 'success');
                        setMensaje('');
                        cargarDepartamentos();
                    })
                    .catch(err => Swal.fire('Error', 'No se pudo cambiar el estado', 'error'));
            }
        });
    };

    // Lógica de Búsqueda
    const departamentosFiltrados = departamentos.filter(dep => 
        dep.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
        (dep.descripcion && dep.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
    );

    // Lógica de Paginación
    const indexUltimoItem = paginaActual * itemsPorPagina;
    const indexPrimerItem = indexUltimoItem - itemsPorPagina;
    const departamentosPaginados = departamentosFiltrados.slice(indexPrimerItem, indexUltimoItem);
    const totalPaginas = Math.ceil(departamentosFiltrados.length / itemsPorPagina);

    const manejarBusqueda = (e) => {
        setBusqueda(e.target.value);
        setPaginaActual(1); 
    };

    return (
        <div>
            <h2 className="mb-4 fw-bold" style={{ color: '#1f2937' }}>Gestión de Departamentos</h2>
            
            {/* Tarjeta del Formulario */}
            <div className="card sombra-suave border-0 mb-4 p-2">
                <div className="card-body">
                    <form onSubmit={registrar} className="row g-3 align-items-end">
                        <div className="col-md-4">
                            <label className="form-label text-muted small fw-bold">Nombre del Departamento</label>
                            {/* AQUÍ VA LA VALIDACIÓN CORRECTA */}
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Ej. Depto 101" 
                                value={nombre} 
                                onChange={e => setNombre(e.target.value)} 
                                pattern="[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+" 
                                title="Solo letras y números permitidos"
                                required 
                            />
                        </div>
                        <div className="col-md-5">
                            <label className="form-label text-muted small fw-bold">Descripción (Opcional)</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Ej. Piso 1, Torre A" 
                                value={descripcion} 
                                onChange={e => setDescripcion(e.target.value)} 
                            />
                        </div>
                        <div className="col-md-3">
                            <button type="submit" className="btn btn-dark w-100 fw-bold" style={{ whiteSpace: 'nowrap' }}>
                                Registrar
                            </button>
                        </div>
                    </form>
                    {mensaje && <div className="mt-3 text-primary fw-bold">{mensaje}</div>}
                </div>
            </div>

            {/* Título de lista y Buscador */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold m-0" style={{ color: '#1f2937' }}>Departamentos Registrados</h4>
                {/* BUSCADOR RESTAURADO A SU ESTADO ORIGINAL */}
                <input 
                    type="text" 
                    className="form-control w-25" 
                    placeholder="🔍 Buscar..." 
                    value={busqueda} 
                    onChange={manejarBusqueda}
                />
            </div>

            {/* Tabla Estilizada */}
            <div className="card sombra-suave border-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-muted">
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departamentosPaginados.length > 0 ? (
                                departamentosPaginados.map(dep => (
                                    <tr key={dep.id_departamento}>
                                        <td className="text-muted">#{dep.id_departamento}</td>
                                        <td className="fw-bold">{dep.nombre}</td>
                                        <td>{dep.descripcion || <span className="text-muted fst-italic">Sin descripción</span>}</td>
                                        <td>
                                            <span className={`badge ${dep.estado === 'Activo' ? 'bg-success' : 'bg-secondary'}`}>
                                                {dep.estado || 'Activo'}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <button 
                                                onClick={() => toggleEstado(dep.id_departamento, dep.estado || 'Activo')} 
                                                className={`btn btn-sm ${dep.estado === 'Activo' ? 'btn-outline-danger' : 'btn-outline-success'}`}>
                                                {dep.estado === 'Activo' ? 'Inactivar' : 'Reactivar'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">No se encontraron departamentos</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Paginación */}
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