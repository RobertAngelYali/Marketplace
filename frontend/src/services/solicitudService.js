import { API_ENDPOINTS } from '../config/api';

/**
 * Servicio para manejar operaciones relacionadas con solicitudes de proveedor
 */
const solicitudService = {
  async crearSolicitud(solicitudData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay sesión activa');

      const response = await fetch(API_ENDPOINTS.CREAR_SOLICITUD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(solicitudData),
      });

      const json = await safeParseJson(response);
      if (!response.ok) throw new Error((json && json.message) || (json && json.mensaje) || 'Error al crear solicitud');
      return json.data ?? json;
    } catch (error) {
      console.error('Error en crearSolicitud:', error);
      throw error;
    }
  },

  // Obtener todas las solicitudes - usa endpoint admin real
  async obtenerSolicitudes() {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay sesión activa');

      const response = await fetch(API_ENDPOINTS.ADMIN_SOLICITUDES, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const json = await safeParseJson(response);
      if (!response.ok) throw new Error((json && json.message) || 'Error al obtener solicitudes');
      return json.data ?? json;
    } catch (error) {
      console.error('Error en obtenerSolicitudes:', error);
      throw error;
    }
  },

  // Obtener mi solicitud (usuario normal)
  async obtenerMiSolicitud() {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay sesión activa');

      const response = await fetch(API_ENDPOINTS.MI_SOLICITUD, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const json = await safeParseJson(response);
      if (!response.ok) throw new Error((json && json.message) || 'Error al obtener tu solicitud');
      return json.data ?? json;
    } catch (error) {
      console.error('Error en obtenerMiSolicitud:', error);
      throw error;
    }
  },

  // Cambiar estado (admin) -> usa PATCH /api/admin/proveedores/{id}/estado
  async cambiarEstadoSolicitud(id, estado) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay sesión activa');

      const response = await fetch(API_ENDPOINTS.ADMIN_CAMBIAR_ESTADO(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ estado }),
      });

      const json = await safeParseJson(response);
      if (!response.ok) throw new Error((json && json.message) || 'Error al cambiar estado');
      return json.data ?? json;
    } catch (error) {
      console.error('Error en cambiarEstadoSolicitud:', error);
      throw error;
    }
  },

  // wrappers semánticos
  async aprobarSolicitud(id) {
    // usa el string que tu backend espera; en tu controlador validamos cualquier string
    return this.cambiarEstadoSolicitud(id, 'aprobado');
  },

  async rechazarSolicitud(id) {
    return this.cambiarEstadoSolicitud(id, 'rechazado');
  },

  
};

/**
 * Intenta parsear JSON de forma segura. Si viene HTML u otro contenido, devuelve null.
 */
async function safeParseJson(response) {
  const text = await response.text();
  // si empieza con '<' probablemente es HTML
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed.startsWith('<')) {
    // opcional: imprimir para debug
    console.error('Respuesta no-JSON del servidor:', trimmed.slice(0, 300));
    return null;
  }
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    console.error('Error parseando JSON:', e, trimmed.slice(0,300));
    return null;
  }
}



export default solicitudService;
