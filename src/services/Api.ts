import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ CAMBIAR ESTA IP SEGÚN TU PC:
// 1. Abre PowerShell y ejecuta: ipconfig
// 2. Busca "Dirección IPv4" de tu conexión WiFi/Ethernet
// 3. Reemplaza la IP aquí abajo
const LOCAL_IP = '192.168.137.170';  // 👈 Para emulador Android, accede al localhost de tu PC
const API_URL = `http://${LOCAL_IP}:8081`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('❌ Error en la petición:', error.response?.data);
    console.log('❌ Status:', error.response?.status);
    console.log('❌ URL:', error.config?.url);
    
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH SERVICE ====================
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    if (response.data) {
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['token', 'user', 'force_admin', 'force_tecnico']);
  },

  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// ==================== USUARIOS SERVICE ====================
export const usuariosService = {
  getAll: async () => {
    try {
      return await api.get('/api/Usuarios');
    } catch (e) {
      // Si el backend no responde, devolver usuarios de ejemplo
      return {
        data: [
          { id: 1, nom_us: 'Juan', ape_us: 'Pérez', corre: 'juan.perez@email.com' },
          { id: 2, nom_us: 'Ana', ape_us: 'García', corre: 'ana.garcia@email.com' },
          { id: 3, nom_us: 'Luis', ape_us: 'Martínez', corre: 'luis.martinez@email.com' },
        ]
      };
    }
  },
  getById: (id: number) => api.get(`/api/Usuarios/${id}`),
  create: (data: any) => api.post('/api/Usuarios', data),
  update: (id: number, data: any) => api.put(`/api/Usuarios/${id}`, data),
  delete: (id: number) => api.delete(`/api/Usuarios/${id}`),
  downloadTemplate: () => api.get('/api/Usuarios/template', { responseType: 'blob' }),
  getTemplateHeaders: () => api.get('/api/Usuarios/template/headers'),
};

// ==================== ELEMENTOS SERVICE ====================
export const elementosService = {
  getAll: () => api.get('/api/elementos'),
  getById: (id: number) => api.get(`/api/elementos/${id}`),
  create: (data: any) => api.post('/api/elementos', data),
  update: (id: number, data: any) => api.put(`/api/elementos/${id}`, data),
  delete: (id: number) => api.delete(`/api/elementos/${id}`),
  downloadTemplate: () => api.get('/api/elementos/template', { responseType: 'blob' }),
};

// ==================== CATEGORIAS SERVICE ====================
export const categoriasService = {
  getAll: () => api.get('/api/categoria'),
  getById: (id: number) => api.get(`/api/categoria/${id}`),
  create: (data: any) => api.post('/api/categoria', data),
  update: (id: number, data: any) => api.put(`/api/categoria/${id}`, data),
  delete: (id: number) => api.delete(`/api/categoria/${id}`),
  updateEstado: (id: number, estado: any) => api.put(`/api/categoria/${id}`, { estado }),
};

// ==================== SUBCATEGORIAS SERVICE ====================
export const subcategoriasService = {
  getAll: () => api.get('/api/subcategoria'),
  getById: (id: number) => api.get(`/api/subcategoria/${id}`),
  create: (data: any) => api.post('/api/subcategoria', data),
  update: (id: number, data: any) => api.put(`/api/subcategoria/${id}`, data),
  delete: (id: number) => api.delete(`/api/subcategoria/${id}`),
  updateEstado: (id: number, estado: any) => api.put(`/api/subcategoria/${id}`, { estado }),
};

// ==================== PRESTAMOS SERVICE ====================
export const prestamosService = {
  getAll: () => api.get('/api/prestamos'),
  getById: (id: number) => api.get(`/api/prestamos/${id}`),
  create: (data: any) => api.post('/api/prestamos', data),
  update: (id: number, data: any) => api.put(`/api/prestamos/${id}`, data),
  delete: (id: number) => api.delete(`/api/prestamos/${id}`),
};

// ==================== ACCESORIOS SERVICE ====================
export const accesoriosService = {
  getAll: () => api.get('/api/accesorios'),
  getById: (id: number) => api.get(`/api/accesorios/${id}`),
  create: (data: any) => api.post('/api/accesorios', data),
  update: (id: number, data: any) => api.put(`/api/accesorios/${id}`, data),
  delete: (id: number) => api.delete(`/api/accesorios/${id}`),
};

// ==================== SOLICITUDES SERVICE ====================
export const solicitudesService = {
  getAll: () => api.get('/api/solicitudes'),
  getById: (id: number) => api.get(`/api/solicitudes/${id}`),
  create: (data: any) => api.post('/api/solicitudes', data),
  update: (id: number, data: any) => api.put(`/api/solicitudes/actualizar/${id}`, data),
  delete: (id: number) => api.delete(`/api/solicitudes/${id}`),
};

// ==================== ELEMENTO-SOLICITUDES SERVICE ====================
export const elementoSolicitudesService = {
  getAll: () => api.get('/api/elemento-solicitudes'),
  getById: (id: number) => api.get(`/api/elemento-solicitudes/${id}`),
  create: (data: any) => api.post('/api/elemento-solicitudes', data),
  delete: (id: number) => api.delete(`/api/elemento-solicitudes/${id}`),
};

// ==================== TICKETS SERVICE ====================
export const ticketsService = {
  getAll: () => api.get('/api/tickets'),
  getActivos: () => api.get('/api/tickets/activos'),
  getById: (id: number) => api.get(`/api/tickets/${id}`),
  create: (data: any) => api.post('/api/tickets', data),
  delete: (id: number) => api.delete(`/api/tickets/${id}`),
};

// ==================== PROBLEMAS SERVICE ====================
export const problemasService = {
  getDescripciones: () => api.get('/api/problemas/descripcion'),
};

// ==================== ESPACIOS SERVICE ====================
export const espaciosService = {
  getAll: () => api.get('/api/espacios'),
  getById: (id: number) => api.get(`/api/espacios/${id}`),
  create: (data: any) => api.post('/api/espacios', data),
  update: (id: number, data: any) => api.put(`/api/espacios/${id}`, data),
  delete: (id: number) => api.delete(`/api/espacios/${id}`),
};

export default api;
