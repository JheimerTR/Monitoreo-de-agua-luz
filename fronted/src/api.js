import axios from 'axios';

// Cliente HTTP único: agrega el token JWT a cada petición.
// En Docker usa /api (Nginx); en Render se define VITE_API_URL con la URL del backend.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use(cfg => {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

// Si el token expiró o es inválido, se cierra la sesión
api.interceptors.response.use(r => r, err => {
    if (err.response?.status === 401 && localStorage.getItem('token')) {
        localStorage.clear();
        window.location.reload();
    }
    return Promise.reject(err);
});

export default api;
