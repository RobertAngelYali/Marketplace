import React, { useEffect, useMemo, useState } from "react";
import {
  Package,
  Calendar,
  Clock,
  Eye,
  Download,
  RefreshCw,
  ShoppingBag,
  MapPin,
  CreditCard,
  CheckCircle,
  Home,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import pedidoService from "../services/pedidoService";
import authService from "../services/authService";
import toast from "react-hot-toast";

export default function Mispedidos() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descargandoId, setDescargandoId] = useState(null);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const data = await pedidoService.obtenerMisPedidos();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudieron cargar tus pedidos");
    } finally {
      setLoading(false);
    }
  };

  const pedidosActivos = useMemo(
    () => pedidos.filter((pedido) => String(pedido.estado || "").toLowerCase() !== "cancelado"),
    [pedidos]
  );

  const getEstadoColor = (estado) => {
    const estadoStr = String(estado || "").toLowerCase();
    switch (estadoStr) {
      case "pendiente":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "confirmado":
      case "pago_confirmado":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "en_preparacion":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "enviado":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "entregado":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatEstado = (estado) => {
    if (!estado) return "PENDIENTE";
    return String(estado).replace(/_/g, " ").toUpperCase();
  };

  const money = (value) => `S/ ${Number(value || 0).toFixed(2)}`;

  const descargarBoleta = async (pedidoId) => {
    try {
      setDescargandoId(pedidoId);
      const response = await pedidoService.obtenerDetallePedido(pedidoId);
      if (!response?.success || !response?.data) {
        toast.error("No se pudo preparar la boleta");
        return;
      }

      const pedidoDetalle = response.data;
      const { default: boletaPdfService } = await import("../services/boletaPdfService");
      await boletaPdfService.generarBoleta({
        pedido: pedidoDetalle,
        datosEntrega: {
          direccionEntrega: pedidoDetalle.direccionEntrega,
          telefonoContacto: pedidoDetalle.telefonoContacto,
          metodoPago: pedidoDetalle.metodoPago,
        },
        usuario: authService.getCurrentUser(),
      });
      toast.success("Boleta generada correctamente");
    } catch (error) {
      console.error("Error al generar boleta:", error);
      toast.error("No se pudo generar la boleta");
    } finally {
      setDescargandoId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:grid lg:grid-cols-[250px_1fr] lg:gap-8">
        <aside className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:mb-0 lg:min-h-[620px]">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-extrabold text-[#0B2C4D]">
            <Package size={22} />
            Mi cuenta
          </h2>
          <nav className="space-y-2">
            <button className="flex w-full items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-left font-bold text-blue-700">
              <ShoppingBag size={19} />
              Mis pedidos
            </button>
            <button
              onClick={() => navigate("/Miperfil")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <Home size={19} />
              Mi perfil
            </button>
            <button
              onClick={() => navigate("/Catalogo")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              <Package size={19} />
              Seguir comprando
            </button>
          </nav>
        </aside>

        <main>
          <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-semibold text-blue-700">Historial de compras</p>
              <h1 className="mt-1 text-3xl font-extrabold text-slate-900 md:text-4xl">Tus pedidos activos</h1>
              <p className="mt-2 max-w-2xl text-slate-500">
                Revisa tus compras, consulta el detalle y descarga la boleta cuando la necesites.
              </p>
            </div>
            <button
              onClick={fetchPedidos}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              <RefreshCw size={18} />
              Actualizar
            </button>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Pedidos totales</p>
              <p className="mt-2 text-3xl font-extrabold text-blue-700">{pedidos.length}</p>
            </div>
            <div className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Activos</p>
              <p className="mt-2 text-3xl font-extrabold text-green-700">{pedidosActivos.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Monto acumulado</p>
              <p className="mt-2 text-3xl font-extrabold text-[#0B2C4D]">
                {money(pedidos.reduce((total, pedido) => total + Number(pedido.total || 0), 0))}
              </p>
            </div>
          </div>

          {pedidos.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                <ShoppingBag size={42} className="text-blue-700" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900">No tienes pedidos aún</h3>
              <p className="mx-auto mt-2 max-w-md text-slate-500">
                Cuando realices tu primera compra, aparecerá en esta sección junto con su detalle y boleta.
              </p>
              <Link
                to="/Catalogo"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-bold text-white shadow-lg shadow-blue-700/20 transition hover:bg-[#0B2C4D]"
              >
                Ver productos
                <Package size={18} />
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {pedidos.map((pedido) => (
                <article
                  key={pedido.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100">
                        <Package className="text-blue-700" size={34} />
                      </div>
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-extrabold text-slate-900">Pedido #{pedido.numeroPedido}</h2>
                          <span className={`rounded-full border px-3 py-1 text-xs font-bold ${getEstadoColor(pedido.estado)}`}>
                            {formatEstado(pedido.estado)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={15} />
                            {new Date(pedido.fechaPedido).toLocaleDateString("es-PE")}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={15} />
                            {new Date(pedido.fechaPedido).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {pedido.direccionEntrega && (
                            <span className="flex items-center gap-1.5">
                              <MapPin size={15} />
                              {pedido.direccionEntrega}
                            </span>
                          )}
                          {pedido.metodoPago && (
                            <span className="flex items-center gap-1.5">
                              <CreditCard size={15} />
                              {pedido.metodoPago}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end">
                      <div className="rounded-2xl bg-slate-50 px-5 py-3 text-right ring-1 ring-slate-200">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total pagado</p>
                        <p className="text-2xl font-extrabold text-blue-700">{money(pedido.total)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => navigate(`/mispedidos/${pedido.id}`)}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 font-bold text-white transition hover:bg-[#0B2C4D]"
                        >
                          <Eye size={17} />
                          Ver detalle
                        </button>
                        <button
                          onClick={() => descargarBoleta(pedido.id)}
                          disabled={descargandoId === pedido.id}
                          className="inline-flex items-center gap-2 rounded-xl border border-blue-700 px-4 py-2.5 font-bold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {descargandoId === pedido.id ? <RefreshCw className="animate-spin" size={17} /> : <Download size={17} />}
                          Boleta
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
