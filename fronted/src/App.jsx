import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

import Inicio from './pages/Inicio'; // <-- NUEVO
import Departamentos from './pages/Departamentos';
import Dashboard from './pages/Dashboard';
import Reportes from './pages/Reportes';
import Login from './pages/Login'; 
import Usuarios from './pages/Usuarios';
import FormularioRegistro from "./pages/FormularioRegistro";
import axios from 'axios';

axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Sub-componente para gestionar el layout y la ruta activa
function LayoutPrincipal({ usuario, cerrarSesion, mensajeBackend }) {
  const location = useLocation(); // Detecta en qué URL estamos

  // Función que asigna el borde amarillo si la ruta coincide
  const claseActiva = (ruta) => {
    return location.pathname === ruta 
      ? "nav-link text-white px-3 py-2 align-middle w-100 active-menu mb-1 rounded-end" 
      : "nav-link text-secondary px-3 py-2 align-middle w-100 menu-link mb-1 rounded-end";
  };

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        
        {/* MENÚ LATERAL OSCURO */}
        <div className="col-auto col-md-3 col-xl-2 px-0" style={{ backgroundColor: '#111827', minHeight: '100vh' }}>
          <div className="d-flex flex-column align-items-center align-items-sm-start pt-4 text-white min-vh-100">
            <Link to="/" className="d-flex align-items-center pb-4 px-4 me-md-auto text-white text-decoration-none w-100 border-bottom border-secondary">
              <span className="fs-5 d-none d-sm-inline fw-bold text-warning">💧⚡ Monitoreo</span>
            </Link>
            
            <ul className="nav flex-column mb-sm-auto mb-0 w-100 mt-3" id="menu">
              <li className="nav-item w-100 pr-2">
                <Link to="/dashboard" className={claseActiva('/dashboard')}>
                  <span className="ms-2 d-none d-sm-inline">📊 Panel General</span>
                </Link>
              </li>
              <li className="nav-item w-100 pr-2">
                <Link to="/departamentos" className={claseActiva('/departamentos')}>
                  <span className="ms-2 d-none d-sm-inline">🏢 Departamentos</span>
                </Link>
              </li>
              <li className="nav-item w-100 pr-2">
                <Link to="/reportes" className={claseActiva('/reportes')}>
                  <span className="ms-2 d-none d-sm-inline">📈 Reportes</span>
                </Link>
              </li>
              {usuario === 'admin' && (
                  <li className="nav-item w-100 pr-2">
                    <Link to="/usuarios" className={claseActiva('/usuarios')}>
                      <span className="ms-2 d-none d-sm-inline">👥 Usuarios</span>
                    </Link>
                  </li>
                  )}
            </ul>
            
            <div className="p-3 w-100 border-top border-secondary">
              <div className="mb-3 text-center text-sm-start text-secondary">
                <small>Admin: <strong className="text-white">{usuario}</strong></small>
              </div>
              <button className="btn btn-outline-danger w-100 btn-sm" onClick={cerrarSesion}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* ÁREA DE CONTENIDO */}
        <div className="col py-4 px-4">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/departamentos" element={<Departamentos />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/usuarios" element={usuario === 'admin' ? <Usuarios /> : <Inicio />} />
          </Routes>
        </div>

      </div>
    </div>
  );
}

export default function App() {
  const [mensajeBackend, setMensajeBackend] = useState('');
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [usuario, setUsuario] = useState('');

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioActivo');
    if (usuarioGuardado) { setEstaAutenticado(true); setUsuario(usuarioGuardado); }
    axios.get('http://localhost:3001/api/test')
      .then(res => setMensajeBackend(res.data.mensaje))
      .catch(err => setMensajeBackend('Error de conexión'));
  }, []);

  const manejarLogin = (estado) => {
    setEstaAutenticado(estado);
    setUsuario(localStorage.getItem('usuarioActivo'));
  };

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioActivo');
    setEstaAutenticado(false);
    setUsuario('');
  };

  if (!estaAutenticado) return <Login onLogin={manejarLogin} />;

  return (
    <Router>
      <LayoutPrincipal usuario={usuario} cerrarSesion={cerrarSesion} mensajeBackend={mensajeBackend} />
    </Router>
  );
}