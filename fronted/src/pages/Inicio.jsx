import { Link } from 'react-router-dom';

// Accesos rápidos a los módulos del sistema
const modulos = [
    {
        ruta: '/dashboard',
        icono: 'bi-speedometer2',
        color: '#f59e0b',
        titulo: 'Registrar Consumo',
        texto: 'Añade nuevas lecturas mensuales y revisa el historial reciente de variaciones.'
    },
    {
        ruta: '/departamentos',
        icono: 'bi-building',
        color: '#3b82f6',
        titulo: 'Unidades',
        texto: 'Gestiona departamentos, locales comerciales y áreas comunes (piscina, bombas, ascensor).'
    },
    {
        ruta: '/reportes',
        icono: 'bi-bar-chart-line',
        color: '#10b981',
        titulo: 'Ver Reportes',
        texto: 'Consulta el resumen global y los departamentos con mayor y menor consumo.'
    },
    {
        ruta: '/usuarios',
        icono: 'bi-people',
        color: '#8b5cf6',
        titulo: 'Usuarios',
        texto: 'Crea cuentas, asigna roles y desbloquea accesos suspendidos.',
        soloAdmin: true
    }
];

export default function Inicio({ usuario }) {
    const esAdmin = localStorage.getItem('rol') === 'admin';
    const visibles = modulos.filter(m => !m.soloAdmin || esAdmin);
    const columna = visibles.length === 4 ? 'col-sm-6 col-xl-3' : 'col-sm-6 col-lg-4';

    return (
        <div className="mx-auto" style={{ maxWidth: '1000px' }}>
            <div className="mb-5">
                <h1 className="fw-bold" style={{ color: '#1f2937' }}>Bienvenido, {usuario || 'Usuario'}</h1>
                <p className="text-muted fs-5 mt-2 mb-0">
                    Resumen general del sistema de monitoreo de agua y luz. ¿Qué deseas hacer hoy?
                </p>
            </div>

            <div className="row g-4">
                {visibles.map(m => (
                    <div className={columna} key={m.ruta}>
                        <Link
                            to={m.ruta}
                            className="card h-100 border-0 sombra-suave text-decoration-none tarjeta-inicio"
                            style={{ borderTop: `4px solid ${m.color}` }}
                        >
                            <div className="card-body p-4">
                                <i className={`bi ${m.icono} d-block mb-3`} style={{ fontSize: '2rem', color: m.color }}></i>
                                <h2 className="h5 fw-semibold text-dark">{m.titulo}</h2>
                                <p className="text-muted small mb-0">{m.texto}</p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
