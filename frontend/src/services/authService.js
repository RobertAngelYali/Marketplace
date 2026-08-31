import { API_ENDPOINTS } from '../config/api';

const AUTH_CHANGE_EVENT = 'auth-change';

const notifyAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
};

/**
 * Servicio para manejar autenticación
 */
const authService = {
  AUTH_CHANGE_EVENT,

  /**
   * Inicia sesión con email y password
   * @param {Object} credentials - Credenciales del usuario
   * @returns {Promise<Object>} Datos del usuario y token
   */
  async login(credentials) {
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Guardar token y usuario en localStorage
      if (data.success && data.data) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('usuario', JSON.stringify(data.data.usuario));
        notifyAuthChange();
      }

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  /**
   * Cierra la sesión del usuario
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    notifyAuthChange();
  },

  /**
   * Obtiene el usuario actual del localStorage
   * @returns {Object|null} Usuario actual o null
   */
  getCurrentUser() {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      return usuarioStr ? JSON.parse(usuarioStr) : null;
    } catch (error) {
      localStorage.removeItem('usuario');
      return null;
    }
  },

  /**
   * Obtiene el token actual
   * @returns {string|null} Token o null
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Verifica si hay un usuario logueado
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken() && !!this.getCurrentUser();
  },

  /**
   * Obtiene el rol del usuario actual
   * @returns {string} Rol del usuario o 'invitado' si no está logueado
   */
  getUserRole() {
    const usuario = this.getCurrentUser();
    return usuario?.rol || 'invitado';
  },

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} rol - Rol a verificar
   * @returns {boolean}
   */
  hasRole(rol) {
    return this.getUserRole() === rol;
  },

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   * @param {string[]} roles - Array de roles permitidos
   * @returns {boolean}
   */
  hasAnyRole(roles) {
    return roles.includes(this.getUserRole());
  },
};

export default authService;
