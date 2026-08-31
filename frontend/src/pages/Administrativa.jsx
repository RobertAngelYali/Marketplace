import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  User,
  Calendar,
  RefreshCw,
  Package,
  AlertTriangle,
  Boxes,
  Users,
  ShieldCheck,
  Store,
  ClipboardCheck,
} from "lucide-react";
import productoService from "../services/productoService";
import solicitudService from "../services/solicitudService";
import usuarioService from "../services/usuarioService";
import solicitudStockService from "../services/solicitudStockService";

export default function Administrativa() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("pendiente");
  const [procesando, setProcesando] = useState({});
  const [usuarios, setUsuarios] = useState([]);

  const [vistaAdmin, setVistaAdmin] = useState("solicitudes");
  const [productosPendientes, setProductosPendientes] = useState([]);
  const [productosStockBajo, setProductosStockBajo] = useState([]);
  const [solicitudesStock, setSolicitudesStock] = useState([]);
  const [procesandoSolicitudStock, setProcesandoSolicitudStock] = useState({});
  const [respuestasSolicitudStock, setRespuestasSolicitudStock] = useState({});
  const [procesandoProducto, setProcesandoProducto] = useState({});
  const [motivosRechazo, setMotivosRechazo] = useState({});

  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 10;
  const totalPaginas = Math.ceil(usuarios.length / usuariosPorPagina) || 1;

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const data = await solicitudService.obtenerSolicitudes();

      if (!data || !Array.isArray(data)) {
        toast.error("Respuesta inesperada del servidor al obtener solicitudes");
        setSolicitudes([]);
      } else {
        setSolicitudes(data);
      }
    } catch (error) {
      console.error("Error cargarSolicitudes:", error);
      toast.error(error.message || "Error al cargar las solicitudes");
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarUsuarios = async () => {
    try {
      const data = await usuarioService.obtenerUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      toast.error("Error al cargar usuarios");
      setUsuarios([]);
    }
  };

  const cargarProductosPendientes = async () => {
    try {
      const response = await productoService.obtenerProductosPendientesAdmin();
      setProductosPendientes(response.data || []);
    } catch (error) {
      console.error("Error al cargar productos pendientes:", error);
      toast.error(error.message || "Error al cargar productos pendientes");
      setProductosPendientes([]);
    }
  };

  const cargarProductosStockBajo = async () => {
    try {
      const response = await productoService.obtenerProductosStockBajoAdmin();
      setProductosStockBajo(response.data || []);
    } catch (error) {
      console.error("Error al cargar productos con stock bajo:", error);
      toast.error(error.message || "Error al cargar productos con stock bajo");
      setProductosStockBajo([]);
    }
  };

  const cargarSolicitudesStock = async () => {
    try {
      const data = await solicitudStockService.obtenerSolicitudesAdmin();
      setSolicitudesStock(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar solicitudes de stock:", error);
      toast.error(error.message || "Error al cargar solicitudes de stock");
      setSolicitudesStock([]);
    }
  };

  const aprobarProducto = async (productoId) => {
    setProcesandoProducto((prev) => ({ ...prev, [productoId]: true }));

    try {
      await productoService.cambiarEstadoRevisionProducto(
        productoId,
        "APROBADO"
      );
      toast.success("Producto aprobado y publicado");
      await cargarProductosPendientes();
      await cargarProductosStockBajo();
    } catch (error) {
      console.error("Error al aprobar producto:", error);
      toast.error(error.message || "Error al aprobar producto");
    } finally {
      setProcesandoProducto((prev) => ({ ...prev, [productoId]: false }));
    }
  };

  const rechazarProducto = async (productoId) => {
    const motivo = motivosRechazo[productoId];

    if (!motivo || motivo.trim().length < 5) {
      toast.error("Ingresa un motivo de rechazo válido");
      return;
    }

    setProcesandoProducto((prev) => ({ ...prev, [productoId]: true }));

    try {
      await productoService.cambiarEstadoRevisionProducto(
        productoId,
        "RECHAZADO",
        motivo
      );
      toast.success("Producto rechazado");
      setMotivosRechazo((prev) => ({ ...prev, [productoId]: "" }));
      await cargarProductosPendientes();
    } catch (error) {
      console.error("Error al rechazar producto:", error);
      toast.error(error.message || "Error al rechazar producto");
    } finally {
      setProcesandoProducto((prev) => ({ ...prev, [productoId]: false }));
    }
  };

  useEffect(() => {
    cargarSolicitudes();
    cargarUsuarios();
    cargarProductosPendientes();
    cargarProductosStockBajo();
    cargarSolicitudesStock();
  }, []);

  const aprobarSolicitud = async (id) => {
    setProcesando((prev) => ({ ...prev, [id]: true }));

    try {
      await solicitudService.aprobarSolicitud(id);
      toast.success("Solicitud aprobada. Usuario ahora es proveedor.");
      await cargarSolicitudes();
      await cargarUsuarios();
    } catch (error) {
      console.error("aprobarSolicitud error:", error);
      toast.error(error.message || "Error al aprobar solicitud");
    } finally {
      setProcesando((prev) => ({ ...prev, [id]: false }));
    }
  };

  const rechazarSolicitud = async (id) => {
    setProcesando((prev) => ({ ...prev, [id]: true }));

    try {
      await solicitudService.rechazarSolicitud(id);
      toast.success("Solicitud rechazada");
      await cargarSolicitudes();
    } catch (error) {
      console.error("rechazarSolicitud error:", error);
      toast.error(error.message || "Error al rechazar solicitud");
    } finally {
      setProcesando((prev) => ({ ...prev, [id]: false }));
    }
  };

  const cambiarEstadoSolicitudStock = async (id, estado) => {
    setProcesandoSolicitudStock((prev) => ({ ...prev, [id]: true }));

    try {
      await solicitudStockService.cambiarEstado(
        id,
        estado,
        respuestasSolicitudStock[id] || ""
      );

      toast.success("Solicitud de stock actualizada");
      await cargarSolicitudesStock();
    } catch (error) {
      console.error("Error al actualizar solicitud de stock:", error);
      toast.error(error.message || "Error al actualizar solicitud de stock");
    } finally {
      setProcesandoSolicitudStock((prev) => ({ ...prev, [id]: false }));
    }
  };

  const solicitudesFiltradas = solicitudes.filter((sol) => {
    if (filtro === "todos") return true;

    const estado = (sol.estado || sol.estadoSolicitud || "")
      .toString()
      .toLowerCase();

    return estado === filtro;
  });

  const contarSolicitudesPorEstado = (estadoBuscado) => {
    return solicitudes.filter(
      (s) => (s.estado || "").toString().toLowerCase() === estadoBuscado
    ).length;
  };

  const EstadoBadge = ({ estado }) => {
    const e = (estado || "").toString().toLowerCase();

    const configs = {
      pendiente: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: Clock,
        label: "Pendiente",
      },
      aprobado: {
        color: "bg-green-100 text-green-800 border-green-300",
        icon: CheckCircle,
        label: "Aprobado",
      },
      rechazado: {
        color: "bg-red-100 text-red-800 border-red-300",
        icon: XCircle,
        label: "Rechazado",
      },
    };

    const config = configs[e] || configs.pendiente;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const EstadoStockBadge = ({ estado }) => {
    const e = (estado || "PENDIENTE").toString().toUpperCase();

    const configs = {
      PENDIENTE: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        label: "Pendiente",
      },
      EN_REVISION: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        label: "En revisión",
      },
      ATENDIDA: {
        color: "bg-green-100 text-green-800 border-green-300",
        label: "Atendida",
      },
      RECHAZADA: {
        color: "bg-red-100 text-red-800 border-red-300",
        label: "Rechazada",
      },
    };

    const config = configs[e] || configs.PENDIENTE;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <ClipboardCheck className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const seleccionarVista = (vista) => {
    setVistaAdmin(vista);

    if (vista === "usuarios") {
      setPaginaActual(1);
      cargarUsuarios();
    }

    if (vista === "productos") {
      cargarProductosPendientes();
    }

    if (vista === "stock") {
      cargarProductosStockBajo();
    }

    if (vista === "solicitudesStock") {
      cargarSolicitudesStock();
    }
  };

  const actualizarVistaActual = async () => {
    if (vistaAdmin === "solicitudes") {
      await cargarSolicitudes();
    }

    if (vistaAdmin === "usuarios") {
      await cargarUsuarios();
    }

    if (vistaAdmin === "productos") {
      await cargarProductosPendientes();
    }

    if (vistaAdmin === "stock") {
      await cargarProductosStockBajo();
    }

    if (vistaAdmin === "solicitudesStock") {
      await cargarSolicitudesStock();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel administrativo...</p>
        </div>
      </div>
    );
  }

  const indexOfLastUser = paginaActual * usuariosPorPagina;
  const indexOfFirstUser = indexOfLastUser - usuariosPorPagina;
  const usuariosAmostrar = usuarios.slice(indexOfFirstUser, indexOfLastUser);

  const totalUsuarios = usuarios.length;
  const totalAdmins = usuarios.filter((u) => u.rol === "administrador").length;
  const totalProveedores = usuarios.filter((u) => u.rol === "proveedor").length;
  const solicitudesStockPendientes = solicitudesStock.filter(
    (s) => (s.estado || "").toUpperCase() === "PENDIENTE"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Panel Administrativo
              </h1>
              <p className="text-gray-600">
                Gestiona proveedores, usuarios, productos pendientes, alertas
                de stock y solicitudes mayoristas.
              </p>
            </div>

            <button
              onClick={actualizarVistaActual}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar vista
            </button>
          </div>
        </div>

        {/* Indicadores superiores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 my-6">
          <div className="bg-white shadow-sm rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Total de usuarios
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {totalUsuarios}
                </p>
              </div>
              <Users className="w-10 h-10 text-blue-200" />
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Administradores
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {totalAdmins}
                </p>
              </div>
              <ShieldCheck className="w-10 h-10 text-blue-200" />
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Proveedores
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {totalProveedores}
                </p>
              </div>
              <Store className="w-10 h-10 text-blue-200" />
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Productos pendientes
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {productosPendientes.length}
                </p>
              </div>
              <Package className="w-10 h-10 text-blue-200" />
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Solicitudes mayoristas
                </h3>
                <p className="text-3xl font-bold text-blue-600">
                  {solicitudesStockPendientes}
                </p>
              </div>
              <ClipboardCheck className="w-10 h-10 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Tabs principales */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 flex flex-wrap gap-2 border border-blue-100">
          <button
            onClick={() => seleccionarVista("solicitudes")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              vistaAdmin === "solicitudes"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Solicitudes de proveedores
          </button>

          <button
            onClick={() => seleccionarVista("usuarios")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              vistaAdmin === "usuarios"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Usuarios registrados ({usuarios.length})
          </button>

          <button
            onClick={() => seleccionarVista("productos")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              vistaAdmin === "productos"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Productos pendientes ({productosPendientes.length})
          </button>

          <button
            onClick={() => seleccionarVista("stock")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              vistaAdmin === "stock"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Stock bajo ({productosStockBajo.length})
          </button>

          <button
            onClick={() => seleccionarVista("solicitudesStock")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              vistaAdmin === "solicitudesStock"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            Solicitudes mayoristas ({solicitudesStock.length})
          </button>
        </div>

        {/* Filtros de solicitudes */}
        {vistaAdmin === "solicitudes" && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setFiltro("todos")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filtro === "todos"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  Todas ({solicitudes.length})
                </button>

                <button
                  onClick={() => setFiltro("pendiente")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filtro === "pendiente"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  Pendientes ({contarSolicitudesPorEstado("pendiente")})
                </button>

                <button
                  onClick={() => setFiltro("aprobado")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filtro === "aprobado"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  Aprobadas ({contarSolicitudesPorEstado("aprobado")})
                </button>

                <button
                  onClick={() => setFiltro("rechazado")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    filtro === "rechazado"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  Rechazadas ({contarSolicitudesPorEstado("rechazado")})
                </button>
              </div>

              <button
                onClick={cargarSolicitudes}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>
          </div>
        )}

        {/* Vista usuarios */}
        {vistaAdmin === "usuarios" && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Usuarios registrados
                </h2>
                <p className="text-sm text-gray-600">
                  Lista general de usuarios, proveedores y administradores del
                  sistema.
                </p>
              </div>

              <button
                onClick={cargarUsuarios}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>

            {usuarios.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-blue-200 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay usuarios registrados
                </h3>
                <p className="text-gray-500">
                  Cuando se registren usuarios, aparecerán aquí.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                          Apellido
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                          Teléfono
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">
                          Rol
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {usuariosAmostrar.map((usuario) => {
                        const rolColor =
                          usuario.rol === "administrador"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : usuario.rol === "proveedor"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-gray-100 text-gray-700 border-gray-200";

                        return (
                          <tr key={usuario.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {usuario.nombre}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {usuario.apellido}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {usuario.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {usuario.telefono || "Sin teléfono"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${rolColor}`}
                              >
                                {usuario.rol}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() =>
                      setPaginaActual((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={paginaActual === 1}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
                  >
                    Anterior
                  </button>

                  <span className="text-sm text-gray-600">
                    Página {paginaActual} de {totalPaginas}
                  </span>

                  <button
                    onClick={() =>
                      setPaginaActual((prev) =>
                        Math.min(prev + 1, totalPaginas)
                      )
                    }
                    disabled={paginaActual === totalPaginas}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Vista solicitudes */}
        {vistaAdmin === "solicitudes" &&
          (solicitudesFiltradas.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-blue-100">
              <Building2 className="w-16 h-16 text-blue-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay solicitudes
              </h3>
              <p className="text-gray-500">
                {filtro === "todos"
                  ? "No se encontraron solicitudes"
                  : `No hay solicitudes con estado "${filtro}"`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {solicitudesFiltradas.map((s) => {
                const id = s.id;
                const usuarioNombre = s.nombreUsuario;
                const fecha = new Date(s.fechaRegistro).toLocaleDateString(
                  "es-PE"
                );

                const estado = (s.estado || "").toLowerCase();
                const ruc = s.ruc;
                const nombreEmpresa = s.nombreEmpresa;
                const descripcion = s.descripcion;
                const direccion = s.direccion;
                const telefono = s.telefonoEmpresa;
                const email = s.emailEmpresa;

                return (
                  <div
                    key={id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-blue-100"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                              {nombreEmpresa}
                            </h3>
                            <EstadoBadge estado={estado} />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4 text-blue-400" />
                            <span className="font-medium">Usuario:</span>
                            <span>{usuarioNombre || "No especificado"}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span className="font-medium">RUC:</span>
                            <span>{ruc}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4 text-blue-400" />
                            <span className="font-medium">Email:</span>
                            <span>{email}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4 text-blue-400" />
                            <span className="font-medium">Teléfono:</span>
                            <span>{telefono}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600 md:col-span-2">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="font-medium">Dirección:</span>
                            <span>{direccion}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="font-medium">Fecha:</span>
                            <span>{fecha}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Descripción:
                          </p>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {descripcion}
                          </p>
                        </div>
                      </div>

                      {estado === "pendiente" && (
                        <div className="flex lg:flex-col gap-3 lg:min-w-[180px]">
                          <button
                            onClick={() => aprobarSolicitud(id)}
                            disabled={procesando[id]}
                            className="flex-1 lg:flex-none px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                          >
                            {procesando[id] ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Aprobar
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => rechazarSolicitud(id)}
                            disabled={procesando[id]}
                            className="flex-1 lg:flex-none px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                          >
                            {procesando[id] ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                Rechazar
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

        {/* Vista productos pendientes */}
        {vistaAdmin === "productos" && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Productos pendientes de revisión
                </h2>
                <p className="text-sm text-gray-600">
                  Aprueba o rechaza productos enviados por proveedores.
                </p>
              </div>

              <button
                onClick={cargarProductosPendientes}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>

            {productosPendientes.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-blue-200 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay productos pendientes
                </h3>
                <p className="text-gray-500">
                  Cuando un proveedor registre un producto nuevo, aparecerá
                  aquí.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {productosPendientes.map((producto) => (
                  <div
                    key={producto.id}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition"
                  >
                    <div className="flex gap-4 p-4">
                      <div className="w-32 h-32 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                        {producto.imagenes?.length > 0 ? (
                          <img
                            src={producto.imagenes[0].urlImagen}
                            alt={producto.nombre}
                            className="w-full h-full object-contain bg-white p-2"
                            width="128"
                            height="128"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              if (!e.currentTarget.src.endsWith('/placeholder.webp')) {
                                e.currentTarget.src = "/placeholder.webp";
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="text-gray-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {producto.nombre}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {producto.categoriaNombre} •{" "}
                              {producto.subcategoriaNombre}
                            </p>
                          </div>

                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                            Pendiente
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {producto.descripcion || "Sin descripción"}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                          <div>
                            <span className="text-gray-500">Proveedor:</span>
                            <p className="font-medium text-gray-900">
                              {producto.nombreEmpresa || "Sin proveedor"}
                            </p>
                          </div>

                          <div>
                            <span className="text-gray-500">Precio:</span>
                            <p className="font-bold text-blue-600">
                              S/{" "}
                              {Number(producto.precioUnitario || 0).toFixed(2)}
                            </p>
                          </div>

                          <div>
                            <span className="text-gray-500">Stock:</span>
                            <p className="font-medium text-gray-900">
                              {producto.stockDisponible}{" "}
                              {producto.unidadMedida}
                            </p>
                          </div>

                          <div>
                            <span className="text-gray-500">
                              Alerta mínima:
                            </span>
                            <p className="font-medium text-gray-900">
                              {producto.stockMinimoAlerta}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <textarea
                        placeholder="Motivo de rechazo, solo si vas a rechazar..."
                        value={motivosRechazo[producto.id] || ""}
                        onChange={(e) =>
                          setMotivosRechazo((prev) => ({
                            ...prev,
                            [producto.id]: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3"
                        rows={2}
                      />

                      <div className="flex gap-3">
                        <button
                          onClick={() => aprobarProducto(producto.id)}
                          disabled={procesandoProducto[producto.id]}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aprobar
                        </button>

                        <button
                          onClick={() => rechazarProducto(producto.id)}
                          disabled={procesandoProducto[producto.id]}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vista stock bajo */}
        {vistaAdmin === "stock" && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Productos con stock bajo
                </h2>
                <p className="text-sm text-gray-600">
                  Productos cuyo stock actual está por debajo o igual a su
                  alerta mínima.
                </p>
              </div>

              <button
                onClick={cargarProductosStockBajo}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>

            {productosStockBajo.length === 0 ? (
              <div className="text-center py-12">
                <Boxes className="w-16 h-16 text-blue-200 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay alertas de stock
                </h3>
                <p className="text-gray-500">
                  Todos los productos están por encima de su stock mínimo.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase">
                        Proveedor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase">
                        Stock actual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase">
                        Alerta mínima
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-blue-800 uppercase">
                        Estado
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {productosStockBajo.map((producto) => (
                      <tr key={producto.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-white overflow-hidden border border-slate-100">
                              {producto.imagenes?.length > 0 ? (
                                <img
                                  src={producto.imagenes[0].urlImagen}
                                  alt={producto.nombre}
                                  className="w-full h-full object-contain bg-white p-2"
                                  width="48"
                                  height="48"
                                  loading="lazy"
                                  decoding="async"
                                  onError={(e) => {
                                    if (!e.currentTarget.src.endsWith('/placeholder.webp')) {
                                      e.currentTarget.src = "/placeholder.webp";
                                    }
                                  }}
                                />
                              ) : (
                                <Package className="w-full h-full p-3 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {producto.nombre}
                              </p>
                              <p className="text-xs text-gray-500">
                                S/{" "}
                                {Number(
                                  producto.precioUnitario || 0
                                ).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-700">
                          {producto.nombreEmpresa || "Sin proveedor"}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-700">
                          {producto.categoriaNombre}
                        </td>

                        <td className="px-6 py-4 text-sm font-bold text-yellow-700">
                          {producto.stockDisponible} {producto.unidadMedida}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-700">
                          {producto.stockMinimoAlerta}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                            <AlertTriangle className="w-3 h-3" />
                            Stock bajo
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}


        {/* Vista solicitudes mayoristas / stock */}
        {vistaAdmin === "solicitudesStock" && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Solicitudes mayoristas de stock
                </h2>
                <p className="text-sm text-gray-600">
                  Clientes que desean comprar más unidades que el stock disponible.
                </p>
              </div>

              <button
                onClick={cargarSolicitudesStock}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>

            {solicitudesStock.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardCheck className="w-16 h-16 text-blue-200 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay solicitudes mayoristas
                </h3>
                <p className="text-gray-500">
                  Cuando un cliente solicite más stock, aparecerá aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {solicitudesStock.map((solicitud) => {
                  const fecha = solicitud.fechaSolicitud
                    ? new Date(solicitud.fechaSolicitud).toLocaleDateString("es-PE")
                    : "Sin fecha";
                  const estado = (solicitud.estado || "PENDIENTE").toUpperCase();
                  const pendiente = estado === "PENDIENTE" || estado === "EN_REVISION";

                  return (
                    <div
                      key={solicitud.id}
                      className="rounded-xl border border-blue-100 bg-white shadow-sm overflow-hidden"
                    >
                      <div className="p-5">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-lg font-bold text-gray-900">
                                {solicitud.nombreProducto}
                              </h3>
                              <EstadoStockBadge estado={solicitud.estado} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 text-sm mt-4">
                              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                <span className="text-gray-500">Cliente:</span>
                                <p className="font-semibold text-gray-900">
                                  {solicitud.nombreUsuario || "No registrado"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {solicitud.emailUsuario}
                                </p>
                              </div>

                              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                <span className="text-gray-500">Proveedor:</span>
                                <p className="font-semibold text-gray-900">
                                  {solicitud.nombreEmpresa || "Sin proveedor"}
                                </p>
                              </div>

                              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                                <span className="text-yellow-700">Cantidad solicitada:</span>
                                <p className="font-bold text-yellow-900">
                                  {solicitud.cantidadSolicitada} {solicitud.unidadMedida}
                                </p>
                              </div>

                              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                                <span className="text-red-700">Stock al solicitar:</span>
                                <p className="font-bold text-red-900">
                                  {solicitud.stockActual} {solicitud.unidadMedida}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-gray-700 mb-1">Mensaje del cliente:</p>
                                <p className="text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">
                                  {solicitud.mensaje || "Sin mensaje adicional"}
                                </p>
                              </div>

                              <div>
                                <p className="font-medium text-gray-700 mb-1">Respuesta del administrador:</p>
                                <textarea
                                  value={respuestasSolicitudStock[solicitud.id] ?? solicitud.respuestaAdmin ?? ""}
                                  onChange={(e) =>
                                    setRespuestasSolicitudStock((prev) => ({
                                      ...prev,
                                      [solicitud.id]: e.target.value,
                                    }))
                                  }
                                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                  rows={3}
                                  placeholder="Ejemplo: Se coordinará reposición con el proveedor."
                                />
                              </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-3">
                              Fecha de solicitud: {fecha}
                            </p>
                          </div>

                          {pendiente && (
                            <div className="flex lg:flex-col gap-2 lg:min-w-[170px]">
                              <button
                                onClick={() => cambiarEstadoSolicitudStock(solicitud.id, "EN_REVISION")}
                                disabled={procesandoSolicitudStock[solicitud.id]}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-semibold"
                              >
                                En revisión
                              </button>

                              <button
                                onClick={() => cambiarEstadoSolicitudStock(solicitud.id, "ATENDIDA")}
                                disabled={procesandoSolicitudStock[solicitud.id]}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm font-semibold"
                              >
                                Atendida
                              </button>

                              <button
                                onClick={() => cambiarEstadoSolicitudStock(solicitud.id, "RECHAZADA")}
                                disabled={procesandoSolicitudStock[solicitud.id]}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm font-semibold"
                              >
                                Rechazar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}