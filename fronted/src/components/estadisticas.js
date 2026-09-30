import { useEffect, useState } from 'react';
import api from '../api';

// Colores fijos del sistema: Agua = azul, Luz = ámbar
export const COLORES = {
    agua: '#0ea5e9',
    luz: '#f59e0b',
    'ÓPTIMO': '#16a34a',
    'REGULAR': '#f59e0b',
    'EXCESIVO': '#dc2626',
    'NO CLASIFICADO': '#9ca3af'
};

export const fmt = (n, dec = 1) => Number(n || 0).toLocaleString('es-BO', { maximumFractionDigits: dec });
export const fmtBs = (n) => `Bs ${Number(n || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// "2026-09" -> "sep 26"
export const nombreMes = (ym) => {
    if (!ym) return '';
    const [a, m] = ym.split('-').map(Number);
    return new Date(a, m - 1, 1).toLocaleDateString('es-BO', { month: 'short', year: '2-digit' }).replace('.', '');
};

// Hook: trae todas las estadísticas en una sola llamada
export function useEstadisticas() {
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState('');

    const recargar = () => {
        api.get('/reportes/estadisticas')
            .then(res => { setDatos(res.data); setError(''); })
            .catch(err => setError(err.response?.data?.error || 'No se pudieron cargar las estadísticas'));
    };

    useEffect(() => { recargar(); }, []);

    return { datos, error, recargar };
}
