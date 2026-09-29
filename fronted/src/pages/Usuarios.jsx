import { useState, useEffect } from 'react';
import api from '../api';
import Swal from 'sweetalert2';

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('operador');

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = () => {
        api.get('/usuarios')
            .then(res => setUsuarios(res.data))
            .catch(err => console.error(err));
    };

    const registrar = (e) => {
        e.preventDefault();
        api.post('/usuarios', { username, password, rol })
            .then(res => {
                Swal.fire('¡Éxito!', res.data.mensaje, 'success');
                setUsername('');
                setPassword('');
                cargarUsuarios();
            })
            .catch(err => Swal.fire('Error', err.response?.data?.error || 'No se pudo registrar', 'error'));
    };

    const toggleEstado = (id, estadoActual) => {
        Swal.fire({
            title: '¿Cambiar acceso?',
            text: `El usuario pasará a estar ${estadoActual === 'Activo' ? 'Inactivo' : 'Activo'}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: estadoActual === 'Activo' ? '#dc3545' : '#198754',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Sí, cambiar'
        }).then((result) => {
            if (result.isConfirmed) {
                api.put(`/usuarios/${id}/estado`)
                    .then(res => {
                        Swal.fire('Actualizado', res.data.mensaje, 'success');
                        cargarUsuarios();
                    })
                    .catch(err => Swal.fire('Error', 'No se pudo cambiar el estado', 'error'));
            }
        });
    };

    const desbloquear = (id) => {
        api.put(`/usuarios/${id}/desbloquear`)
            .then(res => {
                Swal.fire('¡Desbloqueado!', res.data.mensaje, 'success');
                cargarUsuarios();
            })
            .catch(err => Swal.fire('Error', 'No se pudo desbloquear', 'error'));
    };

    return (
        <div>
            <h2 className="mb-4 fw-bold" style={{ color: '#1f2937' }}>Gestión de Usuarios</h2>
            
            <div className="card sombra-suave border-0 mb-4 p-2">
                <div className="card-body">
                    <form onSubmit={registrar} className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label text-muted small fw-bold">Nuevo Usuario</label>
                            <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label text-muted small fw-bold">Contraseña</label>
                            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label text-muted small fw-bold">Rol</label>
                            <select className="form-select" value={rol} onChange={e => setRol(e.target.value)}>
                                <option value="operador">Operador</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <button type="submit" className="btn btn-dark w-100 fw-bold">Crear Cuenta</button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card sombra-suave border-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-muted">
                            <tr>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Intentos Fallidos</th>
                                <th className="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.id_usuario}>
                                    <td className="fw-bold">{u.username}</td>
                                    <td><span className={`badge ${u.rol === 'admin' ? 'bg-primary' : 'bg-secondary'}`}>{u.rol.toUpperCase()}</span></td>
                                    <td><span className={`badge ${u.estado === 'Activo' ? 'bg-success' : 'bg-danger'}`}>{u.estado}</span></td>
                                    <td>
                                        {u.intentos_fallidos >= 3 ? <span className="text-danger fw-bold">Bloqueado ({u.intentos_fallidos})</span> : u.intentos_fallidos}
                                    </td>
                                    <td className="text-end">
                                        {u.intentos_fallidos >= 3 && (
                                            <button onClick={() => desbloquear(u.id_usuario)} className="btn btn-sm btn-warning me-2 fw-bold">
                                                <i className="bi bi-unlock me-1"></i>Desbloquear
                                            </button>
                                        )}
                                        {u.username !== 'admin' && ( // Protegemos al admin principal para que no se borre a sí mismo
                                            <button onClick={() => toggleEstado(u.id_usuario, u.estado)} className={`btn btn-sm ${u.estado === 'Activo' ? 'btn-outline-danger' : 'btn-outline-success'}`}>
                                                {u.estado === 'Activo' ? 'Inactivar' : 'Reactivar'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}