import { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';

// Tipos de unidad del edificio
const TIPOS = {
    'Departamento': { icono: 'bi-house-door', clase: 'bg-primary-subtle text-primary-emphasis' },
    'Local': { icono: 'bi-shop', clase: 'bg-warning-subtle text-warning-emphasis' },
    'Área común': { icono: 'bi-tree', clase: 'bg-success-subtle text-success-emphasis' }
};

export default function Departamentos() {
    const [departamentos, setDepartamentos] = useState([]);
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [tipo, setTipo] = useState('Departamento');
    const [filtroTipo, setFiltroTipo] = useState('Todos');
    const [mensaje, setMensaje] = useState('');

    // Estados para Búsqueda y Paginación
    const [busqueda, setBusqueda] = useState('');
    const [paginaActual, setPaginaActual] = useState(1);
    const itemsPorPagina = 5; // Puedes cambiar a 10 o 20 según necesites

    useEffect(() => {
        cargarDepartamentos();
    }, []);

    const cargarDepartamentos = () => {
        api.get('/departamentos')
            .then(res => setDepartamentos(res.data))
            .catch(err => console.error(err));
    };

    const registrar = (e) => {
        e.preventDefault();
        setMensaje('');
        api.post('/departamentos', { nombre, tipo, descripcion })
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
        const colorBoton = estadoActual === 'Activo' ? '#dc3545' : '#198754'; // Rojo para inactivar, Verde para reactivar

        // Reemplazamos window.confirm por SweetAlert2
        Swal.fire({
            title: '¿Estás seguro?',
            text: `El departamento pasará a estado ${estadoActual === 'Activo' ? 'Inactivo' : 'Activo'}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: colorBoton,
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: 'Cancelar',
            reverseButtons: true // Pone el botón de cancelar a la izquierda
        }).then((result) => {
            if (result.isConfirmed) {
                // Si el usuario confirma, hacemos la petición al backend
                api.put(`/departamentos/${id}/estado`)
                    .then(res => {
                        // Mostramos un mensaje de éxito bonito
                        Swal.fire(
                            '¡Actualizado!',
                            res.data.mensaje,
                            'success'
                        );
                        setMensaje(''); // Limpiamos el mensaje de texto antiguo
                        cargarDepartamentos();
                    })
                    .catch(err => Swal.fire('Error', 'No se pudo cambiar el estado', 'error'));
            }
        });
    };

    // 1. Lógica de Búsqueda
    const departamentosFiltrados = departamentos.filter(dep =>
        (filtroTipo === 'Todos' || (dep.tipo || 'Departamento') === filtroTipo) && (
            dep.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            (dep.descripcion && dep.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
        )
    );
    const contarTipo = (t) => departamentos.filter(d => t === 'Todos' || (d.tipo || 'Departamento') === t).length;

    // 2. Lógica de Paginación
    const indexUltimoItem = paginaActual * itemsPorPagina;
    const indexPrimerItem = indexUltimoItem - itemsPorPagina;
    const departamentosPaginados = departamentosFiltrados.slice(indexPrimerItem, indexUltimoItem);
    const totalPaginas = Math.ceil(departamentosFiltrados.length / itemsPorPagina);

    // Función para manejar el cambio en el buscador y regresar a la página 1
    const manejarBusqueda = (e) => {
        setBusqueda(e.target.value);
        setPaginaActual(1); 
    };
return (
        <div>
            <h2 className="mb-4 fw-bold" style={{ color: '#1f2937' }}>Unidades del Edificio</h2>
            
            {/* Tarjeta del Formulario */}
            <div className="card sombra-suave border-0 mb-4 p-2">
                <div className="card-body">
                    <form onSubmit={registrar} className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label text-muted small fw-bold">Tipo</label>
                            <select className="form-select" value={tipo} onChange={e => setTipo(e.target.value)}>
                                <option value="Departamento">Departamento</option>
                                <option value="Local">Local comercial</option>
                                <option value="Área común">Área común</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label text-muted small fw-bold">Nombre</label>
                            <input type="text" className="form-control" placeholder={tipo === 'Área común' ? 'Ej. Piscina' : tipo === 'Local' ? 'Ej. Local Comercial 3' : 'Ej. Apto 101'} value={nombre} onChange={e => setNombre(e.target.value)} required />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label text-muted small fw-bold">Descripción (Opcional)</label>
                            <input type="text" className="form-control" placeholder="Ej. Piso 1, Torre A" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                        </div>
                        <div className="col-md-2">
                            <button type="submit" className="btn btn-dark w-100 fw-bold">Registrar</button>
                        </div>
                    </form>
                    {mensaje && <div className="mt-3 text-primary fw-bold">{mensaje}</div>}
                </div>
            </div>

            {/* Título de lista y Buscador */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                <h4 className="fw-bold m-0" style={{ color: '#1f2937' }}>Unidades Registradas</h4>
                <div className="input-group buscador">
                    <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                    <input 
                        type="text" 
                        className="form-control border-start-0" 
                        placeholder="Buscar..." 
                        value={busqueda} 
                        onChange={manejarBusqueda}
                    />
                </div>
            </div>

            {/* Filtro por tipo */}
            <div className="d-flex flex-wrap gap-2 mb-3">
                {['Todos', 'Departamento', 'Local', 'Área común'].map(t => (
                    <button key={t} type="button"
                        className={`btn btn-sm ${filtroTipo === t ? 'btn-dark' : 'btn-outline-secondary'}`}
                        onClick={() => { setFiltroTipo(t); setPaginaActual(1); }}>
                        {t === 'Todos' ? 'Todas' : t === 'Local' ? 'Locales' : t === 'Área común' ? 'Áreas comunes' : 'Departamentos'}
                        <span className="badge bg-secondary-subtle text-secondary-emphasis ms-2">{contarTipo(t)}</span>
                    </button>
                ))}
            </div>

            {/* Tabla Estilizada */}
            <div className="card sombra-suave border-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-muted">
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Tipo</th>
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
                                        <td>
                                            <span className={`badge ${(TIPOS[dep.tipo] || TIPOS.Departamento).clase}`}>
                                                <i className={`bi ${(TIPOS[dep.tipo] || TIPOS.Departamento).icono} me-1`}></i>{dep.tipo || 'Departamento'}
                                            </span>
                                        </td>
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
                                    <td colSpan="6" className="text-center py-4 text-muted">No se encontraron unidades</td>
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