import React from 'react';
import { Link } from 'react-router-dom'; // Asegúrate de tener esto para la navegación

const Inicio = ({ usuario }) => {
  return (
    <div style={{ padding: '2rem', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Encabezado de Bienvenida */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
          👋 Bienvenido, {usuario || 'Usuario'}
        </h1>
        <p style={{ color: '#4b5563', marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Resumen general del sistema de monitoreo de agua y luz. ¿Qué deseas hacer hoy?
        </p>
      </div>

      {/* Grid de Tarjetas de Acceso Rápido */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem' 
      }}>
        
        {/* Tarjeta 1: Consumos */}
        <Link to="/dashboard" style={cardStyle}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>Registrar Consumo</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Añade nuevas lecturas mensuales y revisa el historial reciente de variaciones.
          </p>
        </Link>

        {/* Tarjeta 2: Departamentos */}
        <Link to="/departamentos" style={cardStyle}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>Departamentos</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Gestiona la información de los inquilinos, familias y locales comerciales.
          </p>
        </Link>

        {/* Tarjeta 3: Reportes */}
        <Link to="/reportes" style={cardStyle}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>Ver Reportes</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Genera estadísticas detalladas y descarga los informes de facturación.
          </p>
        </Link>

      </div>
    </div>
  );
};

// Estilos base para las tarjetas (puedes pasarlos a tu archivo CSS si prefieres)
const cardStyle = {
  backgroundColor: '#ffffff',
  padding: '1.5rem',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  textDecoration: 'none',
  borderTop: '4px solid #3b82f6', // Borde azul decorativo superior
  transition: 'transform 0.2s',
  display: 'block'
};

export default Inicio;