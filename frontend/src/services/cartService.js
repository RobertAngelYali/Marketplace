import { API_BASE_URL } from '../config/api';

/**
 * Servicio para manejar operaciones del carrito
 */
const cartService = {
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
   * Agregar producto al carrito
   * @param {Object} data - {productoId, cantidad}
   * @returns {Promise<Object>}
   */
  async agregarProducto(data) {
    try {
      const token = this.getToken();

      const response = await fetch(`${API_BASE_URL}/usuario/carrito`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al agregar producto');
      }

      return result;
    } catch (error) {
      console.error('Error en agregarProducto:', error);
      throw error;
    }
  },

  /**
   * Obtener carrito completo
   * @returns {Promise<Object>}
   */
  async obtenerCarrito() {
    try {
      const token = this.getToken();

      const response = await fetch(`${API_BASE_URL}/usuario/carrito`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al obtener carrito');
      }

      return result;
    } catch (error) {
      console.error('Error en obtenerCarrito:', error);
      throw error;
    }
  },

  /**
   * Contar items en el carrito
   * @returns {Promise<number>}
   */
  async contarItems() {
    try {
      const token = this.getToken();

      const response = await fetch(`${API_BASE_URL}/usuario/carrito/count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al contar items');
      }

      return result.count || 0;
    } catch (error) {
      console.error('Error en contarItems:', error);
      return 0;
    }
  },

  /**
   * Actualizar cantidad de un item
   * @param {number} carritoId - ID del item en el carrito
   * @param {number} cantidad - Nueva cantidad
   * @returns {Promise<Object>}
   */
  async actualizarCantidad(carritoId, cantidad) {
    try {
      const token = this.getToken();

      const response = await fetch(`${API_BASE_URL}/usuario/carrito/${carritoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cantidad }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar cantidad');
      }

      return result;
    } catch (error) {
      console.error('Error en actualizarCantidad:', error);
      throw error;
    }
  },

  /**
   * Eliminar un producto del carrito
   * @param {number} carritoId - ID del item en el carrito
   * @returns {Promise<Object>}
   */
  async eliminarProducto(carritoId) {
    try {
      const token = this.getToken();

      const response = await fetch(`${API_BASE_URL}/usuario/carrito/${carritoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al eliminar producto');
      }

      return result;
    } catch (error) {
      console.error('Error en eliminarProducto:', error);
      throw error;
    }
  },

  /**
   * Vaciar carrito completo
   * @returns {Promise<Object>}
   */
  async vaciarCarrito() {
    try {
      const token = this.getToken();

      const response = await fetch(`${API_BASE_URL}/usuario/carrito`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al vaciar carrito');
      }

      return result;
    } catch (error) {
      console.error('Error en vaciarCarrito:', error);
      throw error;
    }
  },

  /**
   * Limpiar productos no disponibles
   * @returns {Promise<Object>}
   */
  async limpiarNoDisponibles() {
    try {
      const token = this.getToken();

      const response = await fetch(`${API_BASE_URL}/usuario/carrito/limpiar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al limpiar productos');
      }

      return result;
    } catch (error) {
      console.error('Error en limpiarNoDisponibles:', error);
      throw error;
    }
  },

  /**
   * Realizar el pedido (Checkout)
   * @param {Object} datosEntrega - { direccionEntrega, telefonoContacto, metodoPago }
   * @returns {Promise<Object>}
   */
  async realizarPedido(datosEntrega) {
    try {
      const token = this.getToken();

      const response = await fetch(`${API_BASE_URL}/pedidos/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(datosEntrega),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al procesar el pedido');
      }

      return result;
    } catch (error) {
      console.error('Error en realizarPedido:', error);
      throw error;
    }
  },
};

export default cartService;