import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use(config => {
  const isLogin = config.url?.includes('auth/login') || config.url?.includes('auth/register');
  if (!isLogin) {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const login = (username, password) =>
  api.post('/auth/login', { username, password }).then(r => r.data);

export const updateProfile = (data) =>
  api.put('/auth/profile', data).then(r => r.data);

export const changePassword = (data) =>
  api.put('/auth/password', data).then(r => r.data);

export const getDashboard = () => api.get('/bff/dashboard').then(r => r.data);

export const getVentas = () => api.get('/ventas?pagina=0&tamaño=20').then(r => r.data);
export const getVentasPaginadas = (pagina = 0, tamaño = 20) => api.get(`/ventas?pagina=${pagina}&tamaño=${tamaño}`).then(r => r.data);
export const createVenta = (data) => api.post('/ventas', data).then(r => r.data);

export const getProductos = () => api.get('/productos').then(r => r.data);
export const getProducto = (id) => api.get(`/productos/${id}`).then(r => r.data);
export const createProducto = (data) => api.post('/productos', data).then(r => r.data);
export const updateProducto = (id, data) => api.put(`/productos/${id}`, data).then(r => r.data);
export const deleteProducto = (id) => api.delete(`/productos/${id}`).then(r => r.data);

export const getSucursales = () => api.get('/sucursales').then(r => r.data);

export const getEmpleados = () => api.get('/empleados').then(r => r.data);

export const getDepartamentos = () => api.get('/departamentos').then(r => r.data);

export const getIndicadores = () => api.get('/indicadores').then(r => r.data);
export const getValoresActuales = () => api.get('/indicadores/valores/actuales').then(r => r.data);
export const inicializarIndicadores = () => api.post('/indicadores/inicializar').then(r => r.data);
export const getCategorias = () => api.get('/indicadores/categorias').then(r => r.data);

export const getUsuarios = () => api.get('/auth/usuarios').then(r => r.data);
export const createUsuario = (data) => api.post('/auth/register', data).then(r => r.data);

export const getTickets = () => api.get('/tickets').then(r => r.data);
export const getTicket = (id) => api.get(`/tickets/${id}`).then(r => r.data);
export const createTicket = (data) => api.post('/tickets', data).then(r => r.data);
export const updateTicketStatus = (id, status) =>
  api.put(`/tickets/${id}/status`, { status }).then(r => r.data);
export const updateTicket = (id, data) => api.put(`/tickets/${id}`, data).then(r => r.data);
export const deleteTicket = (id) => api.delete(`/tickets/${id}`).then(r => r.data);

export const getReportesDashboard = () => api.get('/reportes/dashboard').then(r => r.data);
export const getReportesTickets = () => api.get('/reportes/tickets').then(r => r.data);

export const getVentasMensuales = () => api.get('/reportes/ventas-mensuales').then(r => r.data);
export const getVentasPorCategoria = () => api.get('/reportes/ventas-por-categoria').then(r => r.data);
export const getTopProductos = (limite = 10) => api.get(`/reportes/top-productos?limite=${limite}`).then(r => r.data);

export const getIndicadoresEconomicos = () => api.get('/economico/indicadores').then(r => r.data);
export const getClimaSucursales = () => api.get('/clima/sucursales').then(r => r.data);
export const getTicketAnalytics = () => api.get('/tickets/analytics').then(r => r.data);
export const clasificarTicket = (titulo, descripcion) =>
  api.post('/tickets/clasificar', { titulo, descripcion }).then(r => r.data);

export const exportJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportCSV = (rows, filename) => {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
