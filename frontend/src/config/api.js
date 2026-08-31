// URL base del backend
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const API_ENDPOINTS = {
  // Usuarios
  REGISTRO: `${API_BASE_URL}/usuarios/registro`,
  VERIFICAR_EMAIL: `${API_BASE_URL}/usuarios/verificar-email`,
  LOGIN: `${API_BASE_URL}/auth/login`,

  // Solicitudes de proveedor (usuarios normales)
  CREAR_SOLICITUD: `${API_BASE_URL}/usuario/proveedor/solicitar`,
  MI_SOLICITUD: `${API_BASE_URL}/usuario/proveedor/mi-solicitud`,
  VERIFICAR_SOLICITUD: `${API_BASE_URL}/usuario/proveedor/verificar`,

  // Admin
  ADMIN_SOLICITUDES: `${API_BASE_URL}/admin/proveedores/solicitudes`,
  ADMIN_SOLICITUDES_PENDIENTES: `${API_BASE_URL}/admin/proveedores/solicitudes/pendientes`,
  ADMIN_CAMBIAR_ESTADO: (id) => `${API_BASE_URL}/admin/proveedores/${id}/estado`,
  ADMIN_LISTAR_USUARIOS: `${API_BASE_URL}/admin/usuarios/lista`,

  // Solicitudes de stock / compras mayoristas
  CREAR_SOLICITUD_STOCK: `${API_BASE_URL}/usuario/solicitudes-stock`,
  MIS_SOLICITUDES_STOCK: `${API_BASE_URL}/usuario/solicitudes-stock/mis-solicitudes`,
  ADMIN_SOLICITUDES_STOCK: `${API_BASE_URL}/admin/solicitudes-stock`,
  ADMIN_SOLICITUDES_STOCK_PENDIENTES: `${API_BASE_URL}/admin/solicitudes-stock/pendientes`,
  ADMIN_CAMBIAR_ESTADO_SOLICITUD_STOCK: (id) => `${API_BASE_URL}/admin/solicitudes-stock/${id}/estado`,

  // Admin - Productos
  ADMIN_PRODUCTOS_PENDIENTES: `${API_BASE_URL}/admin/productos/pendientes`,
  ADMIN_PRODUCTOS_STOCK_BAJO: `${API_BASE_URL}/admin/productos/stock-bajo`,
  ADMIN_CAMBIAR_ESTADO_PRODUCTO: (id) =>
    `${API_BASE_URL}/admin/productos/${id}/revision`,

  // Productos - Proveedor
  PROVEEDOR_PRODUCTOS: `${API_BASE_URL}/proveedor/productos`,
  PROVEEDOR_PRODUCTO_DETALLE: (id) => `${API_BASE_URL}/proveedor/productos/${id}`,
  PROVEEDOR_PRODUCTO_ACTUALIZAR: (id) => `${API_BASE_URL}/proveedor/productos/${id}`,
  PROVEEDOR_PRODUCTO_ELIMINAR: (id) => `${API_BASE_URL}/proveedor/productos/${id}`,
  PROVEEDOR_AGREGAR_IMAGEN: (productoId) => `${API_BASE_URL}/proveedor/productos/${productoId}/imagenes`,
  PROVEEDOR_ELIMINAR_IMAGEN: (productoId, imagenId) => `${API_BASE_URL}/proveedor/productos/${productoId}/imagenes/${imagenId}`,
  PROVEEDOR_PRODUCTOS_STOCK_BAJO: `${API_BASE_URL}/proveedor/productos/stock-bajo`,

  // Productos - Público
  PUBLIC_PRODUCTOS: `${API_BASE_URL}/public/productos`,
  PUBLIC_PRODUCTO_DETALLE: (productoId) => `${API_BASE_URL}/public/productos/${productoId}`,
  PUBLIC_PRODUCTOS_CATEGORIA: (categoriaId) => `${API_BASE_URL}/public/productos/categoria/${categoriaId}`,
  PUBLIC_RESENAS_PRODUCTO: (productoId) => `${API_BASE_URL}/public/productos/${productoId}/resenas`,
  CREAR_RESENA_PRODUCTO: (productoId) => `${API_BASE_URL}/usuario/productos/${productoId}/resenas`,

  // Favoritos - Usuario
  FAVORITOS_LISTAR: `${API_BASE_URL}/usuario/favoritos`,
  FAVORITOS_IDS: `${API_BASE_URL}/usuario/favoritos/ids`,
  FAVORITO_VERIFICAR: (productoId) => `${API_BASE_URL}/usuario/favoritos/${productoId}/existe`,
  FAVORITO_AGREGAR: (productoId) => `${API_BASE_URL}/usuario/favoritos/${productoId}`,
  FAVORITO_ELIMINAR: (productoId) => `${API_BASE_URL}/usuario/favoritos/${productoId}`,
  FAVORITO_TOGGLE: (productoId) => `${API_BASE_URL}/usuario/favoritos/${productoId}/toggle`,

  // Categorías - Público
  PUBLIC_CATEGORIAS: `${API_BASE_URL}/public/categorias`,
  PUBLIC_SUBCATEGORIAS: `${API_BASE_URL}/public/categorias/subcategorias`,
  PUBLIC_SUBCATEGORIAS_POR_CATEGORIA: (categoriaId) => `${API_BASE_URL}/public/categorias/${categoriaId}/subcategorias`,

  // Carrito
  CARRITO_AGREGAR: `${API_BASE_URL}/usuario/carrito`,
  CARRITO_OBTENER: `${API_BASE_URL}/usuario/carrito`,
  CARRITO_COUNT: `${API_BASE_URL}/usuario/carrito/count`,
  CARRITO_ACTUALIZAR: (carritoId) => `${API_BASE_URL}/usuario/carrito/${carritoId}`,
  CARRITO_ELIMINAR: (carritoId) => `${API_BASE_URL}/usuario/carrito/${carritoId}`,
  CARRITO_VACIAR: `${API_BASE_URL}/usuario/carrito`,
  CARRITO_LIMPIAR: `${API_BASE_URL}/usuario/carrito/limpiar`,

  // ⭐ NUEVO: Pedidos
  PEDIDOS_MIS_PEDIDOS: `${API_BASE_URL}/pedidos/mis-pedidos`,
  PEDIDOS_DETALLE: (pedidoId) => `${API_BASE_URL}/pedidos/${pedidoId}/detalles`,
};

export default API_BASE_URL;