import { API_BASE_URL } from '../config/api';

const pedidoService = {
  /**
   * Obtiene el token del localStorage
   * @returns {string} Token de autenticación
   */
  getToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    return token;
  },

  /**
   * Obtiene todos los pedidos del usuario autenticado
   * @returns {Promise<Array>} Lista de pedidos
   */
  async obtenerMisPedidos() {
    try {
      const token = this.getToken();

      const response = await fetch(`${API_BASE_URL}/pedidos/mis-pedidos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener pedidos');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en obtenerMisPedidos:', error);
      throw error;
    }
  },

  /**
   * Obtiene el detalle completo de un pedido específico
   * @param {number} pedidoId - ID del pedido
   * @returns {Promise<Object>} Detalle del pedido con productos
   */
  async obtenerDetallePedido(pedidoId) {
    try {
      const token = this.getToken();

      const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}/detalles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener detalle del pedido');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en obtenerDetallePedido:', error);
      throw error;
    }
  },
};

export default pedidoService;