import { API_ENDPOINTS } from '../config/api';
import authService from './authService';

const favoritoService = {
  getToken() {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Debes iniciar sesión para usar favoritos');
    }
    return token;
  },

  async listar() {
    const token = this.getToken();
    const response = await fetch(API_ENDPOINTS.FAVORITOS_LISTAR, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener favoritos');
    }
    return data;
  },

  async listarIds() {
    const token = this.getToken();
    const response = await fetch(API_ENDPOINTS.FAVORITOS_IDS, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener favoritos');
    }
    return data;
  },

  async verificar(productoId) {
    const token = this.getToken();
    const response = await fetch(API_ENDPOINTS.FAVORITO_VERIFICAR(productoId), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al verificar favorito');
    }
    return data;
  },

  async agregar(productoId) {
    const token = this.getToken();
    const response = await fetch(API_ENDPOINTS.FAVORITO_AGREGAR(productoId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al agregar favorito');
    }
    return data;
  },

  async eliminar(productoId) {
    const token = this.getToken();
    const response = await fetch(API_ENDPOINTS.FAVORITO_ELIMINAR(productoId), {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al eliminar favorito');
    }
    return data;
  },

  async toggle(productoId) {
    const token = this.getToken();
    const response = await fetch(API_ENDPOINTS.FAVORITO_TOGGLE(productoId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar favorito');
    }
    return data;
  },
};

export default favoritoService;
