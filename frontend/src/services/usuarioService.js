import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

/**
 * Servicio para manejar operaciones relacionadas con usuarios
 */
const usuarioService = {
  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async registrarUsuario(userData) {
    try {
      const response = await fetch(API_ENDPOINTS.REGISTRO, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Si hay errores de validación, los formateamos
        if (data.errors) {
          const errores = Object.values(data.errors).join(', ');
          throw new Error(errores);
        }
        throw new Error(data.message || 'Error al registrar usuario');
      }

      return data;
    } catch (error) {
      console.error('Error en registrarUsuario:', error);
      throw error;
    }
  },

  /**
   * Verifica si un email está disponible
   * @param {string} email - Email a verificar
   * @returns {Promise<boolean>} true si está disponible
   */
  async verificarEmail(email) {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.VERIFICAR_EMAIL}?email=${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        throw new Error('Error al verificar email');
      }

      const data = await response.json();
      return data.disponible;
    } catch (error) {
      console.error('Error en verificarEmail:', error);
      throw error;
    }
  },

  // Método auxiliar para obtener token
  getToken() {
    return localStorage.getItem('token');
  },

  async obtenerUsuarios() {
  try {
    const token = localStorage.getItem('token'); // tu panel admin necesita JWT

    const response = await fetch(API_ENDPOINTS.ADMIN_LISTAR_USUARIOS, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en obtenerUsuarios:', error);
    throw error;
  }
},

/**
   * Obtener perfil del usuario logueado
   */
  async obtenerPerfil() {
    try {
      const token = this.getToken();
      // Si API_BASE_URL no está definido, usa 'http://localhost:8080/api'
      const baseUrl = API_BASE_URL || 'http://localhost:8080/api'; 
      
      const response = await fetch(`${baseUrl}/usuarios/perfil`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al cargar perfil');
      return await response.json();
    } catch (error) {
      console.error('Error obtenerPerfil:', error);
      throw error;
    }
  },

  /**
   * Actualizar perfil
   */
  async actualizarPerfil(datos) {
    try {
      const token = this.getToken();
      const baseUrl = API_BASE_URL || 'http://localhost:8080/api';

      const response = await fetch(`${baseUrl}/usuarios/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al actualizar');
      
      return data;
    } catch (error) {
      console.error('Error actualizarPerfil:', error);
      throw error;
    }
  }
};



export default usuarioService;