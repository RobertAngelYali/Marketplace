import { useState, useEffect } from 'react';
import authService from '../services/authService';

/**
 * Hook personalizado para manejar autenticación y autorización
 */
export const useAuth = () => {
  const [usuario, setUsuario] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const syncAuth = () => {
      setUsuario(authService.getCurrentUser());
      setLoading(false);
    };

    syncAuth();
    window.addEventListener(authService.AUTH_CHANGE_EVENT, syncAuth);
    window.addEventListener('storage', syncAuth);

    return () => {
      window.removeEventListener(authService.AUTH_CHANGE_EVENT, syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, []);

  /**
   * Verifica si el usuario está autenticado
   */
  const isAuthenticated = () => {
    return !!authService.getToken() && !!usuario;
  };

  /**
   * Obtiene el rol del usuario actual
   */
  const getRol = () => {
    return usuario?.rol || 'invitado';
  };

  /**
   * Devuelve la ruta inicial correcta según el rol.
   * Así admin y proveedor no regresan a pantallas de compra.
   */
  const getHomeByRole = () => {
    const rol = getRol();

    if (rol === 'administrador') return '/Administrativa';
    if (rol === 'proveedor') return '/proveedor/productos';
    return '/';
  };

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = (rol) => {
    const rolActual = getRol();
    return rolActual === rol;
  };

  /**
   * Verifica si el usuario tiene alguno de los roles permitidos
   */
  const hasAnyRole = (roles) => {
    const rolActual = getRol();
    return roles.includes(rolActual);
  };

  /**
   * Verifica permisos para acceder a páginas específicas
   */
  const canAccess = (pagina) => {
    const rol = getRol();

    const permisos = {
      // Flujo de compra / cliente
      home: ['invitado', 'usuario'],
      Catalogo: ['invitado', 'usuario'],
      contacto: ['invitado', 'usuario'],
      carrito: ['invitado', 'usuario'],
      Checkout: ['invitado', 'usuario'],
      VistaProducto: ['invitado', 'usuario'],
      miperfil: ['usuario', 'proveedor', 'administrador'],
      mispedidos: ['usuario'],
      favoritos: ['usuario'],
      solicitarproveedor: ['usuario'],
      detallepedido: ['usuario'],

      // Panel de proveedor
      ReportesP: ['proveedor'],
      misproductos: ['proveedor'],
      crearproducto: ['proveedor'],
      editarproducto: ['proveedor'],

      // Panel de administrador
      administrativa: ['administrador'],
    };

    return permisos[pagina]?.includes(rol) || false;
  };

  /**
   * Verifica si el usuario actual es proveedor
   */
  const isProveedor = () => {
    return hasRole('proveedor');
  };

  /**
   * Verifica si el usuario actual es administrador
   */
  const isAdmin = () => {
    return hasRole('administrador');
  };

  /**
   * Verifica si el usuario actual es un usuario normal
   */
  const isUsuario = () => {
    return hasRole('usuario');
  };

  return {
    usuario,
    loading,
    isAuthenticated,
    getRol,
    getHomeByRole,
    hasRole,
    hasAnyRole,
    canAccess,
    isProveedor,
    isAdmin,
    isUsuario,
  };
};
