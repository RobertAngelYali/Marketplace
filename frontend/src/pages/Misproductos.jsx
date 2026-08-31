import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Ban
} from 'lucide-react';
import productoService from '../services/productoService';

export default function MisProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await productoService.obtenerMisProductos();

      if (response.success) {
        setProductos(response.data || []);
      } else {
        setError('Error al cargar productos');
      }
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const eliminarProducto = async (productoId, nombreProducto) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${nombreProducto}"?`)) {
      return;
    }

    try {
      const response = await productoService.eliminarProducto(productoId);

      if (response.success) {
        setMensaje({
          tipo: 'success',
          texto: 'Producto eliminado exitosamente'
        });
        cargarProductos();
      }
    } catch (err) {
      setMensaje({
        tipo: 'error',
        texto: err.message || 'Error al eliminar producto'
      });
    }

    setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
  };

  const normalizarEstado = (estado) => {
    return (estado || 'PENDIENTE').toString().toUpperCase();
  };

  const productosFiltrados = productos.filter((producto) => {
    const texto = busqueda.toLowerCase();

    const coincideBusqueda =
      producto.nombre?.toLowerCase().includes(texto) ||
      producto.descripcion?.toLowerCase().includes(texto) ||
      producto.categoriaNombre?.toLowerCase().includes(texto) ||
      producto.subcategoriaNombre?.toLowerCase().includes(texto);

    const estado = normalizarEstado(producto.estadoRevision);

    const coincideEstado =
      filtroEstado === 'todos' || estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  const totalPendientes = productos.filter(
    (p) => normalizarEstado(p.estadoRevision) === 'PENDIENTE'
  ).length;

  const totalAprobados = productos.filter(
    (p) => normalizarEstado(p.estadoRevision) === 'APROBADO'
  ).length;

  const totalRechazados = productos.filter(
    (p) => normalizarEstado(p.estadoRevision) === 'RECHAZADO'
  ).length;

  const totalStockBajo = productos.filter((p) => p.stockBajo).length;

  const EstadoRevisionBadge = ({ estado }) => {
    const estadoNormalizado = normalizarEstado(estado);

    const config = {
      PENDIENTE: {
        label: 'En revisión',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock
      },
      APROBADO: {
        label: 'Publicado',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle
      },
      RECHAZADO: {
        label: 'Rechazado',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle
      }
    };

    const current = config[estadoNormalizado] || config.PENDIENTE;
    const Icon = current.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${current.className}`}
      >
        <Icon size={13} />
        {current.label}
      </span>
    );
  };

  const EstadoInventarioBadge = ({ producto }) => {
    if (producto.agotado || producto.stockDisponible === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
          <Ban size={13} />
          Agotado
        </span>
      );
    }

    if (producto.stockBajo) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
          <AlertTriangle size={13} />
          Stock bajo
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
        <CheckCircle size={13} />
        Stock correcto
      </span>
    );
  };

  const precioNormal = (valor) => {
    return Number(valor || 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Mis Productos
              </h1>
              <p className="text-gray-600 mt-1">
                Revisa el estado de tus productos, stock y aprobación del administrador.
              </p>
            </div>

            <button
              onClick={() => window.location.href = '/proveedor/productos/nuevo'}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Nuevo Producto
            </button>
          </div>

          {/* Indicadores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
            <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total productos</p>
              <p className="text-2xl font-bold text-blue-700">{productos.length}</p>
            </div>

            <div className="bg-white border border-yellow-100 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">En revisión</p>
              <p className="text-2xl font-bold text-yellow-700">{totalPendientes}</p>
            </div>

            <div className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Publicados</p>
              <p className="text-2xl font-bold text-blue-700">{totalAprobados}</p>
            </div>

            <div className="bg-white border border-red-100 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Rechazados</p>
              <p className="text-2xl font-bold text-red-700">{totalRechazados}</p>
            </div>

            <div className="bg-white border border-yellow-100 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">Stock bajo</p>
              <p className="text-2xl font-bold text-yellow-700">{totalStockBajo}</p>
            </div>
          </div>

          {/* Mensajes */}
          {mensaje.texto && (
            <div
              className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
                mensaje.tipo === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {mensaje.tipo === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <XCircle size={20} />
              )}
              <span>{mensaje.texto}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <select
              aria-label="Filtrar productos por estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="todos">Todos los estados</option>
              <option value="PENDIENTE">En revisión</option>
              <option value="APROBADO">Publicados</option>
              <option value="RECHAZADO">Rechazados</option>
            </select>

            <button
              onClick={cargarProductos}
              className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition font-medium"
            >
              Actualizar
            </button>
          </div>
        </div>

        {/* Lista de productos */}
        {productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-blue-100">
            <Package size={64} className="mx-auto text-blue-200 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {busqueda || filtroEstado !== 'todos'
                ? 'No se encontraron productos'
                : 'No tienes productos aún'}
            </h3>
            <p className="text-gray-500 mb-6">
              {busqueda || filtroEstado !== 'todos'
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Comienza agregando tu primer producto para revisión'}
            </p>

            {!busqueda && filtroEstado === 'todos' && (
              <button
                onClick={() => window.location.href = '/proveedor/productos/nuevo'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Crear Primer Producto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {productosFiltrados.map((producto) => {
              const estadoRevision = normalizarEstado(producto.estadoRevision);
              const estaRechazado = estadoRevision === 'RECHAZADO';
              const estaPendiente = estadoRevision === 'PENDIENTE';

              return (
                <div
                  key={producto.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-100"
                >
                  {/* Imagen del producto */}
                  <div className="h-48 bg-white relative overflow-hidden">
                    {producto.imagenes && producto.imagenes.length > 0 ? (
                      <img
                        src={producto.imagenes[0].urlImagen}
                        alt={producto.nombre}
                        className="w-full h-full object-contain bg-white p-2"
                        width="400"
                        height="300"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          if (!e.currentTarget.src.endsWith('/placeholder.webp')) {
                            e.currentTarget.src = '/placeholder.webp';
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={48} className="text-gray-400" />
                      </div>
                    )}

                    <div className="absolute top-2 left-2">
                      <EstadoRevisionBadge estado={producto.estadoRevision} />
                    </div>

                    <div className="absolute top-2 right-2">
                      <EstadoInventarioBadge producto={producto} />
                    </div>
                  </div>

                  {/* Información del producto */}
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        {producto.nombre}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {producto.categoriaNombre}
                        {producto.subcategoriaNombre
                          ? ` • ${producto.subcategoriaNombre}`
                          : ''}
                      </p>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {producto.descripcion || 'Sin descripción'}
                    </p>

                    {estaRechazado && (
                      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                          <XCircle size={16} />
                          Producto rechazado
                        </div>
                        <p className="text-sm">
                          {producto.motivoRechazo ||
                            'El administrador no registró un motivo.'}
                        </p>
                      </div>
                    )}

                    {estaPendiente && (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          <Clock size={16} />
                          Este producto está esperando revisión del administrador.
                        </div>
                      </div>
                    )}

                    {producto.stockBajo && !producto.agotado && (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                          <AlertTriangle size={16} />
                          Alerta de stock bajo
                        </div>
                        <p className="text-sm">
                          Stock actual: {producto.stockDisponible} {producto.unidadMedida}. 
                          Mínimo configurado: {producto.stockMinimoAlerta}.
                        </p>
                      </div>
                    )}

                    {producto.agotado && (
                      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                          <Ban size={16} />
                          Producto agotado. Debes reponer stock.
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Precio:</span>
                        <div className="text-right">
                          {producto.precioOferta ? (
                            <>
                              <span className="block font-bold text-blue-700">
                                S/ {precioNormal(producto.precioOferta)}
                              </span>
                              <span className="block text-xs text-gray-500 line-through">
                                S/ {precioNormal(producto.precioUnitario)}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-blue-700">
                              S/ {precioNormal(producto.precioUnitario)} / {producto.unidadMedida}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Stock actual:</span>
                        <span
                          className={`font-semibold ${
                            producto.agotado
                              ? 'text-red-600'
                              : producto.stockBajo
                              ? 'text-yellow-700'
                              : 'text-green-600'
                          }`}
                        >
                          {producto.stockDisponible} {producto.unidadMedida}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Alerta mínima:</span>
                        <span className="font-semibold text-gray-900">
                          {producto.stockMinimoAlerta ?? 10}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Disponible:</span>
                        <span
                          className={`font-semibold ${
                            producto.disponible ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {producto.disponible ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                      {estadoRevision === 'APROBADO' && (
                        <button
                          onClick={() => window.location.href = `/vista_producto?id=${producto.id}`}
                          className="flex-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors"
                        >
                          <Eye size={16} />
                          Ver
                        </button>
                      )}

                      <button
                        onClick={() =>
                          window.location.href = `/proveedor/productos/editar/${producto.id}`
                        }
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Edit size={16} />
                        Editar
                      </button>

                      <button
                        onClick={() => eliminarProducto(producto.id, producto.nombre)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 transition-colors"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>

                    {estadoRevision === 'APROBADO' && (
                      <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg p-2 mt-3">
                        Este producto ya está publicado en el ecommerce.
                      </p>
                    )}

                    {estadoRevision === 'PENDIENTE' && (
                      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-100 rounded-lg p-2 mt-3">
                        Si editas este producto, seguirá pendiente hasta que el administrador lo apruebe.
                      </p>
                    )}

                    {estadoRevision === 'RECHAZADO' && (
                      <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg p-2 mt-3">
                        Puedes editarlo y reenviarlo para una nueva revisión.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}