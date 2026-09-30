import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import api from './api';

import Inicio from './pages/Inicio'; // <-- NUEVO
import Departamentos from './pages/Departamentos';
import Dashboard from './pages/Dashboard';
import Reportes from './pages/Reportes';
import Login from './pages/Login'; 
import Usuarios from './pages/Usuarios';
import FormularioRegistro from "./pages/FormularioRegistro";

// Sub-componente para gestionar el layout y la ruta activa
// Escritorio: menú fijo a la izquierda y solo el contenido hace scroll.
// Celular: barra superior con botón ☰ que abre el menú como panel lateral.
function LayoutPrincipal({ usuario, cerrarSesion }) {
  const location = useLocation(); // Detecta en qué URL estamos
  const [menuAbierto, setMenuAbierto] = useState(false);
  const contenidoRef = useRef(null);
  const esAdmin = localStorage.getItem('rol') === 'admin';

  // Al cambiar de página, el contenido vuelve arriba
  useEffect(() => {
    contenidoRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  const cerrarMenu = () => setMenuAbierto(false);

  // Función que asigna el borde amarillo si la ruta coincide
  const claseActiva = (ruta) => {
    return location.pathname === ruta 
      ? "nav-link text-white px-3 py-2 align-middle w-100 active-menu mb-1 rounded-end" 
      : "nav-link text-secondary px-3 py-2 align-middle w-100 menu-link mb-1 rounded-end";
  };

  const enlaces = [
    { ruta: '/dashboard', icono: 'bi-speedometer2', texto: 'Panel General' },
    { ruta: '/departamentos', icono: 'bi-building', texto: 'Departamentos' },
    { ruta: '/reportes', icono: 'bi-bar-chart-line', texto: 'Reportes' },
    ...(esAdmin ? [{ ruta: '/usuarios', icono: 'bi-people', texto: 'Usuarios' }] : [])
  ];

  return (
    <div className="app-shell">

      {/* BARRA SUPERIOR (solo celular) */}
      <header className="app-topbar">
        <Link to="/" className="text-decoration-none fw-bold text-warning fs-5" onClick={cerrarMenu}>
          <i className="bi bi-droplet-half me-1"></i><i className="bi bi-lightning-charge-fill me-2"></i>Monitoreo
        </Link>
        <button className="btn btn-outline-light btn-sm" onClick={() => setMenuAbierto(true)} aria-label="Abrir menú">
          <i className="bi bi-list fs-5"></i>
        </button>
      </header>

      {/* Fondo oscuro detrás del menú abierto (solo celular) */}
      {menuAbierto && <div className="app-backdrop" onClick={cerrarMenu}></div>}

      {/* MENÚ LATERAL OSCURO */}
      <aside className={`app-sidebar ${menuAbierto ? 'abierto' : ''}`}>
        <div className="d-flex align-items-center justify-content-between pt-4 pb-4 px-4 border-bottom border-secondary">
          <Link to="/" className="text-white text-decoration-none" onClick={cerrarMenu}>
            <span className="fs-5 fw-bold text-warning"><i className="bi bi-droplet-half me-1"></i><i className="bi bi-lightning-charge-fill me-2"></i>Monitoreo</span>
          </Link>
          <button className="btn btn-sm text-secondary app-cerrar-menu" onClick={cerrarMenu} aria-label="Cerrar menú">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <ul className="nav flex-column w-100 mt-3 flex-grow-1" id="menu">
          {enlaces.map(e => (
            <li className="nav-item w-100 pr-2" key={e.ruta}>
              <Link to={e.ruta} className={claseActiva(e.ruta)} onClick={cerrarMenu}>
                <i className={`bi ${e.icono}`}></i><span className="ms-2">{e.texto}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="p-3 w-100 border-top border-secondary">
          <div className="mb-3 text-secondary">
            <small>{esAdmin ? 'Admin' : 'Operador'}: <strong className="text-white">{usuario}</strong></small>
          </div>
          <button className="btn btn-outline-danger w-100 btn-sm" onClick={cerrarSesion}>
            <i className="bi bi-box-arrow-right me-1"></i>Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO: lo único que hace scroll */}
      <main className="app-main" ref={contenidoRef}>
        <div className="app-contenido">
          <Routes>
            <Route path="/" element={<Inicio usuario={usuario} />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/departamentos" element={<Departamentos />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/usuarios" element={esAdmin ? <Usuarios /> : <Inicio usuario={usuario} />} />
          </Routes>
        </div>
      </main>

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
    api.get('/test')
      .then(res => setMensajeBackend(res.data.mensaje))
      .catch(err => setMensajeBackend('Error de conexión'));
  }, []);

  const manejarLogin = (estado) => {
    setEstaAutenticado(estado);
    setUsuario(localStorage.getItem('usuarioActivo'));
  };

  const cerrarSesion = () => {
    localStorage.clear();
    setEstaAutenticado(false);
    setUsuario('');
  };

  if (!estaAutenticado) return <Login onLogin={manejarLogin} />;

  return (
    <Router>
      <LayoutPrincipal usuario={usuario} cerrarSesion={cerrarSesion} />
    </Router>
  );
}