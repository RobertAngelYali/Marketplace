import { API_ENDPOINTS } from '../config/api';

const resenaService = {
  async listarPorProducto(productoId) {
    const response = await fetch(API_ENDPOINTS.PUBLIC_RESENAS_PRODUCTO(productoId));
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al cargar comentarios');
    }

    return data;
  },

  async crear(productoId, payload) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Debes iniciar sesión para comentar');
    }

    const response = await fetch(API_ENDPOINTS.CREAR_RESENA_PRODUCTO(productoId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const validationErrors = data.errors ? Object.values(data.errors).join('. ') : null;
      throw new Error(validationErrors || data.message || 'Error al publicar comentario');
    }

    return data;
  },
};

export default resenaService;
