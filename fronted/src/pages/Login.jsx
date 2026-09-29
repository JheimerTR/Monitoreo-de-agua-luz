import { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const manejarAcceso = (e) => {
        e.preventDefault();
        setError('');

        axios.post('https://monitoreo-de-agua-luz.onrender.com/api/auth/login', { username, password })
            .then(res => {
                // Almacenamos la sesión en el navegador (RF12)
                localStorage.setItem('usuarioActivo', res.data.username);
                onLogin(true); // Cambiamos el estado en App.jsx para darle acceso
            })
            .catch(err => {
                setError(err.response?.data?.error || 'Error al conectar con el servidor');
            });
    };

    return (
        <div className="d-flex align-items-center justify-content-center vh-100" style={{ backgroundColor: '#f3f4f6' }}>
            <div className="card shadow-lg border-0 rounded-4 p-4" style={{ maxWidth: '400px', width: '100%' }}>
                
                <div className="text-center mb-4 mt-2">
                    <div className="mb-3">
                        <span style={{ fontSize: '3rem' }}>💧⚡</span>
                    </div>
                    <h3 className="fw-bold" style={{ color: '#1f2937' }}>Sistema de Monitoreo</h3>
                    <p className="text-muted small">Ingresa tus credenciales para acceder al panel</p>
                </div>

                {/* Alerta de error (contraseña incorrecta, cuenta bloqueada, etc.) */}
                {error && (
                    <div className="alert alert-danger py-2 text-center small fw-bold mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={manejarAcceso}>
                    <div className="mb-3">
                        <label className="form-label fw-bold text-muted small">Usuario</label>
                        <input 
                            type="text" 
                            className="form-control form-control-lg bg-light border-0" 
                            placeholder="Ej. admin"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required 
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-bold text-muted small">Contraseña</label>
                        <input 
                            type="password" 
                            className="form-control form-control-lg bg-light border-0" 
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-dark btn-lg w-100 fw-bold rounded-3 shadow-sm mb-2">
                        Iniciar Sesión
                    </button>
                </form>
                
            </div>
        </div>
    );
}