export const trazabilidadService = {
  getByTicketId: async (ticketId: number | string) => {
    const authConfig = await withAuth();
    console.log('[TRAZABILIDAD] Configuración de autorización enviada:', authConfig);
    return api.get(`/api/trazabilidad/ticket/${ticketId}`, authConfig);
  },
};
// ==================== ROLES SERVICE ====================
export const rolesService = {
  getAll: async () => api.get('/api/roles', await withAuth()),
};
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ CAMBIAR ESTA IP SEGÚN TU PC:
// 1. Abre PowerShell y ejecuta: ipconfig
// 2. Busca "Dirección IPv4" de tu conexión WiFi/Ethernet
// 3. Reemplaza la IP aquí abajo
// Cambia esta IP si tu PC tiene otra dirección IPv4 en la red WiFi
const LOCAL_IP = '192.168.1.90'; // IP actualizada según el usuario
const API_URL = `http://${LOCAL_IP}:8081`;
console.log('[API] URL base usada:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Helper para agregar el token de Authorization a una config
const withAuth = async (config: any = {}) => {
  if (!config.headers) config.headers = {};
  const token = await AsyncStorage.getItem('token');
  console.log('[AUTH] Token usado en petición:', token);
  if (token) {
    // Asegura que el token siempre se envía como 'Bearer <token>'
    config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  }
  return config;
};

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
    // El backend espera 'username' y 'password' en el payload
    const response = await api.post('/auth/login', { username, password });
    const data = response.data as any;
    if (data.token) {
      await AsyncStorage.setItem('token', data.token);
    }
    return data;
  },

  getMe: async () => {
    const config = await withAuth();
    const response = await api.get('/auth/me', config);
    const data = response.data as any;
    if (data) {
      await AsyncStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['token', 'user', 'force_admin', 'force_tecnico']);
  },

  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  obtenerSolicitudesPendientes: async () => {
    try {
      const config = await withAuth();
      const response = await api.get('/api/solicitudes/pendientes', config);
      return response.data;
    } catch (error) {
      console.error('Error al obtener solicitudes pendientes:', error);
      throw error;
    }
  },

  obtenerCategorias: async () => {
    try {
      const config = await withAuth();
      const response = await api.get('/api/categoria', config);
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return [];
    }
  },

  obtenerSubcategorias: async () => {
    try {
      const config = await withAuth();
      const response = await api.get('/api/subcategoria', config);
      return response.data;
    } catch (error) {
      console.error('Error al obtener subcategorías:', error);
      return [];
    }
  },

  obtenerPrestamosActivos: async () => {
    try {
      const config = await withAuth();
      const response = await api.get('/api/prestamos/activos', config);
      return response.data;
    } catch (error) {
      console.error('Error al obtener préstamos activos:', error);
      return [];
    }
  },
};

// ==================== USUARIOS SERVICE ====================
export const usuariosService = {
    updateProfile: async (data: any) => {
      const config = await withAuth();
      return api.put('/api/Usuarios/perfil/me', data, config);
    },
  getAll: async () => {
    try {
      const config = await withAuth();
      return await api.get('/api/Usuarios', config);
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
  getById: async (id: number) => {
    const config = await withAuth();
    return api.get(`/api/Usuarios/${id}`, config);
  },
  create: async (data: any) => {
    const config = await withAuth();
    return api.post('/api/Usuarios', data, config);
  },
  update: async (id: number, data: any) => {
    const config = await withAuth();
    return api.put(`/api/Usuarios/${id}`, data, config);
  },
  delete: async (id: number) => {
    const config = await withAuth();
    return api.delete(`/api/Usuarios/${id}`, config);
  },
  downloadTemplate: async () => {
    const config = await withAuth({ responseType: 'blob' });
    return api.get('/api/Usuarios/template', config);
  },
  getTemplateHeaders: async () => {
    const config = await withAuth();
    return api.get('/api/Usuarios/template/headers', config);
  },
};

// ==================== ELEMENTOS SERVICE ====================
export const elementosService = {
  getAll: async () => api.get('/api/elementos', await withAuth()),
  getById: async (id: number) => api.get(`/api/elementos/${id}`, await withAuth()),
  create: async (data: any) => api.post('/api/elementos', data, await withAuth()),
  update: async (id: number, data: any) => api.put(`/api/elementos/${id}`, data, await withAuth()),
  delete: async (id: number) => api.delete(`/api/elementos/${id}`, await withAuth()),
  downloadTemplate: async () => api.get('/api/elementos/template', await withAuth({ responseType: 'blob' })),
};

// ==================== CATEGORIAS SERVICE ====================
export const categoriasService = {
  getAll: async () => api.get('/api/categoria', await withAuth()),
  getById: async (id: number) => api.get(`/api/categoria/${id}`, await withAuth()),
  create: async (data: any) => api.post('/api/categoria', data, await withAuth()),
  update: async (id: number, data: any) => api.put(`/api/categoria/${id}`, data, await withAuth()),
  delete: async (id: number) => api.delete(`/api/categoria/${id}`, await withAuth()),
  updateEstado: async (id: number, estado: any) => api.put(`/api/categoria/${id}`, { estado }, await withAuth()),
};

// ==================== SUBCATEGORIAS SERVICE ====================
export const subcategoriasService = {
  getAll: async () => api.get('/api/subcategoria', await withAuth()),
  getById: async (id: number) => api.get(`/api/subcategoria/${id}`, await withAuth()),
  create: async (data: any) => api.post('/api/subcategoria', data, await withAuth()),
  update: async (id: number, data: any) => api.put(`/api/subcategoria/${id}`, data, await withAuth()),
  delete: async (id: number) => api.delete(`/api/subcategoria/${id}`, await withAuth()),
  updateEstado: async (id: number, estado: any) => api.put(`/api/subcategoria/${id}`, { estado }, await withAuth()),
};

// ==================== PRESTAMOS SERVICE ====================
export const prestamosService = {
  getAll: async () => api.get('/api/prestamos', await withAuth()),
  getById: async (id: number) => api.get(`/api/prestamos/${id}`, await withAuth()),
  create: async (data: any) => api.post('/api/prestamos', data, await withAuth()),
  update: async (id: number, data: any) => api.put(`/api/prestamos/${id}`, data, await withAuth()),
  delete: async (id: number) => api.delete(`/api/prestamos/${id}`, await withAuth()),
};

// ==================== ACCESORIOS SERVICE ====================
export const accesoriosService = {
  getAll: async () => api.get('/api/accesorios', await withAuth()),
  getById: async (id: number) => api.get(`/api/accesorios/${id}`, await withAuth()),
  create: async (data: any) => api.post('/api/accesorios', data, await withAuth()),
  update: async (id: number, data: any) => api.put(`/api/accesorios/${id}`, data, await withAuth()),
  delete: async (id: number) => api.delete(`/api/accesorios/${id}`, await withAuth()),
};

// ==================== SOLICITUDES SERVICE ====================
export const solicitudesService = {
  getAll: async () => api.get('/api/solicitudes', await withAuth()),
  getById: async (id: number) => api.get(`/api/solicitudes/${id}`, await withAuth()),
  create: async (data: any) => api.post('/api/solicitudes', data, await withAuth()),
  update: async (id: number, data: any) => {
    const config = await withAuth();
    const response = await api.put(`/api/solicitudes/actualizar/${id}`, data, config);
    return response.data;
  },
  delete: async (id: number) => api.delete(`/api/solicitudes/${id}`, await withAuth()),
};

// ==================== ELEMENTO-SOLICITUDES SERVICE ====================
export const elementoSolicitudesService = {
  getAll: async () => api.get('/api/elemento-solicitudes', await withAuth()),
  getById: async (id: number) => api.get(`/api/elemento-solicitudes/${id}`, await withAuth()),
  create: async (data: any) => api.post('/api/elemento-solicitudes', data, await withAuth()),
  delete: async (id: number) => api.delete(`/api/elemento-solicitudes/${id}`, await withAuth()),
};

// ==================== TICKETS SERVICE ====================
export const ticketsService = {
  getAll: async () => api.get('/api/tickets', await withAuth()),
  getActivos: async () => api.get('/api/tickets/activos', await withAuth()),
  getById: async (id: number) => api.get(`/api/tickets/${id}`, await withAuth()),
  create: async (data: any) => api.post('/api/tickets', data, await withAuth()),
  update: async (id: number, data: any) => api.put(`/api/tickets/${id}`, data, await withAuth()),
  delete: async (id: number) => api.delete(`/api/tickets/${id}`, await withAuth()),
};

// ==================== PROBLEMAS SERVICE ====================
export const problemasService = {
  getDescripciones: async () => api.get('/api/problemas/descripcion', await withAuth()),
};

// ==================== ESPACIOS SERVICE ====================
export const espaciosService = {
  getAll: async () => api.get('/api/espacios', await withAuth()),
  getById: async (id: number) => api.get(`/api/espacios/${id}`, await withAuth()),
  create: async (data: any) => api.post('/api/espacios', data, await withAuth()),
  update: async (id: number, data: any) => api.put(`/api/espacios/${id}`, data, await withAuth()),
  delete: async (id: number) => api.delete(`/api/espacios/${id}`, await withAuth()),
};

export default api;
