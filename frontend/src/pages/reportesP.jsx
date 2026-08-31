import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Filter,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import ventaService from "../services/ventaService";

const formatoMoneda = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

const formatoFecha = new Intl.DateTimeFormat("es-PE", {
  dateStyle: "medium",
  timeStyle: "short",
});

const normalizarTexto = (valor) => String(valor || "").toLowerCase().trim();

const obtenerFechaISO = (fecha) => {
  if (!fecha) return "";
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const formatearFecha = (fecha) => {
  if (!fecha) return "Sin fecha";
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return formatoFecha.format(date);
};

const estadoClases = (estado = "") => {
  const estadoNormalizado = normalizarTexto(estado);
  if (estadoNormalizado.includes("entregado")) return "bg-green-100 text-green-700";
  if (estadoNormalizado.includes("cancelado")) return "bg-red-100 text-red-700";
  if (estadoNormalizado.includes("pendiente")) return "bg-yellow-100 text-yellow-700";
  if (estadoNormalizado.includes("enviado")) return "bg-purple-100 text-purple-700";
  return "bg-blue-100 text-blue-700";
};

export default function ReportesP() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estado, setEstado] = useState("TODOS");

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await ventaService.obtenerMisVentas();
      setVentas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar reportes:", err);
      setError(err.message || "No se pudieron cargar los reportes");
      toast.error("No se pudieron cargar los reportes");
    } finally {
      setLoading(false);
    }
  };

  const ventasFiltradas = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    return ventas.filter((venta) => {
      const coincideTexto = !texto || [
        venta.numeroPedido,
        venta.nombreProducto,
        venta.clienteNombre,
      ].some((campo) => normalizarTexto(campo).includes(texto));

      const fechaVenta = obtenerFechaISO(venta.fechaVenta);
      const coincideFechaInicio = !fechaInicio || (fechaVenta && fechaVenta >= fechaInicio);
      const coincideFechaFin = !fechaFin || (fechaVenta && fechaVenta <= fechaFin);
      const coincideEstado = estado === "TODOS" || normalizarTexto(venta.estadoPedido) === normalizarTexto(estado);

      return coincideTexto && coincideFechaInicio && coincideFechaFin && coincideEstado;
    });
  }, [ventas, busqueda, fechaInicio, fechaFin, estado]);

  const estadosDisponibles = useMemo(() => {
    const estados = new Set(ventas.map((venta) => venta.estadoPedido).filter(Boolean));
    return ["TODOS", ...Array.from(estados)];
  }, [ventas]);

  const resumen = useMemo(() => {
    const totalIngresos = ventasFiltradas.reduce((acc, venta) => acc + Number(venta.subtotal || 0), 0);
    const totalUnidades = ventasFiltradas.reduce((acc, venta) => acc + Number(venta.cantidad || 0), 0);
    const totalVentas = ventasFiltradas.length;
    const clientesUnicos = new Set(ventasFiltradas.map((venta) => venta.clienteNombre).filter(Boolean)).size;
    const ticketPromedio = totalVentas > 0 ? totalIngresos / totalVentas : 0;

    return {
      totalIngresos,
      totalUnidades,
      totalVentas,
      clientesUnicos,
      ticketPromedio,
    };
  }, [ventasFiltradas]);

  const productosTop = useMemo(() => {
    const acumulado = new Map();

    ventasFiltradas.forEach((venta) => {
      const nombre = venta.nombreProducto || "Producto sin nombre";
      const actual = acumulado.get(nombre) || {
        nombre,
        cantidad: 0,
        total: 0,
      };

      actual.cantidad += Number(venta.cantidad || 0);
      actual.total += Number(venta.subtotal || 0);
      acumulado.set(nombre, actual);
    });

    return Array.from(acumulado.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [ventasFiltradas]);

  const ventasPorDia = useMemo(() => {
    const acumulado = new Map();

    ventasFiltradas.forEach((venta) => {
      const fecha = obtenerFechaISO(venta.fechaVenta) || "Sin fecha";
      const actual = acumulado.get(fecha) || { fecha, total: 0, cantidad: 0 };
      actual.total += Number(venta.subtotal || 0);
      actual.cantidad += 1;
      acumulado.set(fecha, actual);
    });

    return Array.from(acumulado.values())
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(-7);
  }, [ventasFiltradas]);

  const ventasPorEstado = useMemo(() => {
    const acumulado = new Map();

    ventasFiltradas.forEach((venta) => {
      const nombreEstado = venta.estadoPedido || "Sin estado";
      acumulado.set(nombreEstado, (acumulado.get(nombreEstado) || 0) + 1);
    });

    return Array.from(acumulado.entries()).map(([nombre, cantidad]) => ({ nombre, cantidad }));
  }, [ventasFiltradas]);

  const maxProducto = Math.max(...productosTop.map((producto) => producto.total), 1);
  const maxDia = Math.max(...ventasPorDia.map((dia) => dia.total), 1);
  const maxEstado = Math.max(...ventasPorEstado.map((item) => item.cantidad), 1);

  const limpiarFiltros = () => {
    setBusqueda("");
    setFechaInicio("");
    setFechaFin("");
    setEstado("TODOS");
  };

  const descargarCSV = () => {
    if (ventasFiltradas.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const cabeceras = [
      "Pedido",
      "Fecha",
      "Producto",
      "Cliente",
      "Cantidad",
      "Precio unitario",
      "Subtotal",
      "Estado",
    ];

    const filas = ventasFiltradas.map((venta) => [
      venta.numeroPedido || "",
      formatearFecha(venta.fechaVenta),
      venta.nombreProducto || "",
      venta.clienteNombre || "",
      venta.cantidad || 0,
      Number(venta.precioUnitario || 0).toFixed(2),
      Number(venta.subtotal || 0).toFixed(2),
      venta.estadoPedido || "",
    ]);

    const csv = [cabeceras, ...filas]
      .map((fila) => fila.map((valor) => `"${String(valor).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `reporte-ventas-${new Date().toISOString().slice(0, 10)}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
    toast.success("Reporte exportado correctamente");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700 mb-3">
              <BarChart3 size={16} /> Panel del proveedor
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Reportes de ventas</h1>
            <p className="text-gray-500 mt-2">Analiza tus ingresos, productos más vendidos y movimientos recientes.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={cargarReportes}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <RefreshCw size={18} /> Actualizar
            </button>
            <button
              onClick={descargarCSV}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-[#0B2C4D]"
            >
              <Download size={18} /> Exportar CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertTriangle className="mt-0.5 shrink-0" size={20} />
            <div>
              <p className="font-bold">No se pudo cargar la información</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
          <ResumenCard icon={<DollarSign size={24} />} titulo="Ingresos" valor={formatoMoneda.format(resumen.totalIngresos)} detalle="Total vendido" />
          <ResumenCard icon={<ShoppingBag size={24} />} titulo="Ventas" valor={resumen.totalVentas} detalle="Operaciones" />
          <ResumenCard icon={<Package size={24} />} titulo="Unidades" valor={resumen.totalUnidades} detalle="Productos vendidos" />
          <ResumenCard icon={<TrendingUp size={24} />} titulo="Promedio" valor={formatoMoneda.format(resumen.ticketPromedio)} detalle="Por venta" />
          <ResumenCard icon={<Users size={24} />} titulo="Clientes" valor={resumen.clientesUnicos} detalle="Compradores únicos" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="text-blue-600" size={20} />
            <h2 className="font-bold text-gray-900">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div className="xl:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Producto, cliente o pedido..."
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Desde</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hasta</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {estadosDisponibles.map((item) => (
                  <option key={item} value={item}>{item === "TODOS" ? "Todos" : item}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-gray-500">
            <p>Mostrando <strong className="text-gray-800">{ventasFiltradas.length}</strong> de <strong className="text-gray-800">{ventas.length}</strong> registros.</p>
            <button onClick={limpiarFiltros} className="font-semibold text-blue-600 hover:text-[#0B2C4D]">Limpiar filtros</button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Productos con más ingresos</h2>
                <p className="text-sm text-gray-500">Top 5 según los filtros aplicados</p>
              </div>
              <Package className="text-blue-600" size={24} />
            </div>

            {productosTop.length > 0 ? (
              <div className="space-y-4">
                {productosTop.map((producto, index) => (
                  <div key={producto.nombre}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{index + 1}. {producto.nombre}</p>
                        <p className="text-xs text-gray-500">{producto.cantidad} unidades vendidas</p>
                      </div>
                      <span className="font-bold text-blue-700 whitespace-nowrap">{formatoMoneda.format(producto.total)}</span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(7, (producto.total / maxProducto) * 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState texto="Aún no hay productos vendidos en este rango." />
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Estados</h2>
                <p className="text-sm text-gray-500">Distribución de pedidos</p>
              </div>
              <Calendar className="text-blue-600" size={24} />
            </div>

            {ventasPorEstado.length > 0 ? (
              <div className="space-y-4">
                {ventasPorEstado.map((item) => (
                  <div key={item.nombre}>
                    <div className="flex justify-between gap-3 mb-2 text-sm">
                      <span className="font-semibold text-gray-800">{item.nombre}</span>
                      <span className="font-bold text-gray-900">{item.cantidad}</span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(8, (item.cantidad / maxEstado) * 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState texto="No hay estados para mostrar." />
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ingresos recientes</h2>
              <p className="text-sm text-gray-500">Últimos 7 días con ventas dentro del filtro</p>
            </div>
            <BarChart3 className="text-blue-600" size={24} />
          </div>

          {ventasPorDia.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end min-h-52">
              {ventasPorDia.map((dia) => (
                <div key={dia.fecha} className="flex flex-col justify-end gap-2 rounded-xl bg-gray-50 p-3 min-h-44">
                  <div className="flex flex-1 items-end">
                    <div
                      className="w-full rounded-t-xl bg-blue-600 transition-all"
                      style={{ height: `${Math.max(12, (dia.total / maxDia) * 100)}%` }}
                      title={formatoMoneda.format(dia.total)}
                    ></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 truncate">{dia.fecha}</p>
                    <p className="text-xs text-gray-500">{formatoMoneda.format(dia.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState texto="No hay ingresos recientes para graficar." />
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Detalle de ventas</h2>
              <p className="text-sm text-gray-500">Listado completo según filtros aplicados</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Producto</th>
                  <th className="p-4 font-semibold">Pedido</th>
                  <th className="p-4 font-semibold">Cliente</th>
                  <th className="p-4 font-semibold text-center">Cantidad</th>
                  <th className="p-4 font-semibold text-right">Subtotal</th>
                  <th className="p-4 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ventasFiltradas.length > 0 ? (
                  ventasFiltradas.map((venta) => (
                    <tr key={venta.id} className="transition hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={venta.imagenUrl || "/placeholder.webp"}
                            alt={venta.nombreProducto || "Producto"}
                            className="w-12 h-12 rounded-lg object-contain border border-gray-200 bg-white p-1"
                            width="48"
                            height="48"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              if (!e.currentTarget.src.endsWith("/placeholder.webp")) {
                                e.currentTarget.src = "/placeholder.webp";
                              }
                            }}
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{venta.nombreProducto}</p>
                            <p className="text-xs text-gray-500">c/u {formatoMoneda.format(Number(venta.precioUnitario || 0))}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-gray-800">#{venta.numeroPedido}</p>
                        <p className="text-xs text-gray-500">{formatearFecha(venta.fechaVenta)}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{venta.clienteNombre || "Sin cliente"}</td>
                      <td className="p-4 text-center">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">{venta.cantidad}</span>
                      </td>
                      <td className="p-4 text-right font-extrabold text-blue-700">{formatoMoneda.format(Number(venta.subtotal || 0))}</td>
                      <td className="p-4 text-center">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${estadoClases(venta.estadoPedido)}`}>
                          {venta.estadoPedido || "Sin estado"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-10">
                      <EmptyState texto="No se encontraron ventas con los filtros aplicados." />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumenCard({ icon, titulo, valor, detalle }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-500">{titulo}</p>
      <p className="mt-1 text-2xl font-extrabold text-gray-900">{valor}</p>
      <p className="mt-1 text-xs text-gray-500">{detalle}</p>
    </div>
  );
}

function EmptyState({ texto }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
      <Package className="mb-3 text-gray-300" size={44} />
      <p className="font-semibold">{texto}</p>
    </div>
  );
}
