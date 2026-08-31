import { API_ENDPOINTS } from '../config/api';

async function safeParseJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Respuesta no válida del servidor:', text.slice(0, 300));
    return null;
  }
}

const solicitudStockService = {
  getToken() {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No hay sesión activa');
    return token;
  },

  async crearSolicitud({ productoId, cantidadSolicitada, mensaje }) {
    const token = this.getToken();

    const response = await fetch(API_ENDPOINTS.CREAR_SOLICITUD_STOCK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ productoId, cantidadSolicitada, mensaje }),
    });

    const json = await safeParseJson(response);
    if (!response.ok) {
      throw new Error((json && json.message) || 'Error al enviar solicitud de stock');
    }

    return json?.data ?? json;
  },

  async obtenerMisSolicitudes() {
    const token = this.getToken();

    const response = await fetch(API_ENDPOINTS.MIS_SOLICITUDES_STOCK, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const json = await safeParseJson(response);
    if (!response.ok) {
      throw new Error((json && json.message) || 'Error al obtener tus solicitudes');
    }

    return json?.data ?? [];
  },

  async obtenerSolicitudesAdmin() {
    const token = this.getToken();

    const response = await fetch(API_ENDPOINTS.ADMIN_SOLICITUDES_STOCK, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const json = await safeParseJson(response);
    if (!response.ok) {
      throw new Error((json && json.message) || 'Error al obtener solicitudes de stock');
    }

    return json?.data ?? [];
  },

  async cambiarEstado(solicitudId, estado, respuestaAdmin = '') {
    const token = this.getToken();

    const response = await fetch(API_ENDPOINTS.ADMIN_CAMBIAR_ESTADO_SOLICITUD_STOCK(solicitudId), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ estado, respuestaAdmin }),
    });

    const json = await safeParseJson(response);
    if (!response.ok) {
      throw new Error((json && json.message) || 'Error al actualizar la solicitud');
    }

    return json?.data ?? json;
  },
};

export default solicitudStockService;
