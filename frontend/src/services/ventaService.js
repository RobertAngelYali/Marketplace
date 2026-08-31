import { API_BASE_URL } from '../config/api';

const ventaService = {
  async obtenerMisVentas() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/proveedor/ventas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener ventas');
    }

    return response.json();
  }
};

export default ventaService;