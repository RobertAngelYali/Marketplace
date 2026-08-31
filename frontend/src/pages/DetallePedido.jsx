import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Package,
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  ArrowLeft,
  Phone,
  ShoppingBag,
  Store,
  Download,
  CheckCircle,
  Truck,
  RefreshCw,
} from "lucide-react";
import pedidoService from "../services/pedidoService";
import authService from "../services/authService";
import toast from "react-hot-toast";

export default function DetallePedido() {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    fetchDetallePedido();
  }, [pedidoId]);

  const fetchDetallePedido = async () => {
    try {
      setLoading(true);
      const response = await pedidoService.obtenerDetallePedido(pedidoId);

      if (response.success) {
        setPedido(response.data);
      } else {
        toast.error("Error al cargar el detalle del pedido");
        navigate("/Mispedidos");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("No se pudo cargar el detalle del pedido");
      navigate("/Mispedidos");
    } finally {
      setLoading(false);
    }
  };

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

  const descargarBoleta = async () => {
    if (!pedido) return;
    try {
      setDescargando(true);
      const { default: boletaPdfService } = await import("../services/boletaPdfService");
      await boletaPdfService.generarBoleta({
        pedido,
        datosEntrega: {
          direccionEntrega: pedido.direccionEntrega,
          telefonoContacto: pedido.telefonoContacto,
          metodoPago: pedido.metodoPago,
        },
        usuario: authService.getCurrentUser(),
      });
      toast.success("Boleta generada correctamente");
    } catch (error) {
      console.error("Error al generar boleta:", error);
      toast.error("No se pudo generar la boleta");
    } finally {
      setDescargando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando detalle del pedido...</p>
        </div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <Package size={64} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Pedido no encontrado</h3>
          <Link to="/Mispedidos" className="text-blue-700 hover:text-[#0B2C4D] font-bold">
            Volver a Mis Pedidos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <button
          onClick={() => navigate("/Mispedidos")}
          className="mb-6 flex items-center gap-2 font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft size={20} />
          Volver a Mis Pedidos
        </button>

        <section className="mb-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="bg-[#0B2C4D] px-6 py-7 text-white md:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-100">Detalle de compra</p>
                <h1 className="mt-1 text-3xl font-extrabold">Pedido #{pedido.numeroPedido}</h1>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-blue-100">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={16} />
                    {new Date(pedido.fechaPedido).toLocaleDateString("es-PE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} />
                    {new Date(pedido.fechaPedido).toLocaleTimeString("es-PE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:items-end">
                <span className={`rounded-full border px-4 py-2 text-sm font-extrabold ${getEstadoColor(pedido.estado)}`}>
                  {formatEstado(pedido.estado)}
                </span>
                <p className="text-3xl font-extrabold">{money(pedido.total)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8">
            <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <h3 className="mb-2 flex items-center gap-2 font-bold text-slate-800">
                <MapPin size={18} className="text-blue-700" />
                Entrega
              </h3>
              <p className="text-sm text-slate-600">{pedido.direccionEntrega}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <Phone size={15} />
                {pedido.telefonoContacto}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <h3 className="mb-2 flex items-center gap-2 font-bold text-slate-800">
                <CreditCard size={18} className="text-blue-700" />
                Pago
              </h3>
              <p className="text-sm text-slate-600">Método: {pedido.metodoPago}</p>
              <p className="mt-2 flex items-center gap-2 text-sm font-bold text-green-700">
                <CheckCircle size={15} />
                Pago registrado
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <h3 className="mb-2 flex items-center gap-2 font-bold text-slate-800">
                <Truck size={18} className="text-blue-700" />
                Estado
              </h3>
              <p className="text-sm text-slate-600">Tu pedido será gestionado por el equipo de Tienda Don Pepito.</p>
              <button
                onClick={descargarBoleta}
                disabled={descargando}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 font-bold text-white transition hover:bg-[#0B2C4D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {descargando ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
                Descargar boleta
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
                <ShoppingBag size={26} className="text-blue-700" />
                Productos comprados
              </h2>
              <p className="mt-1 text-sm text-slate-500">Detalle de cantidades, proveedores y subtotales.</p>
            </div>
            <div className="rounded-2xl bg-blue-50 px-5 py-3 text-right ring-1 ring-blue-100">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Total</p>
              <p className="text-2xl font-extrabold text-blue-800">{money(pedido.total)}</p>
            </div>
          </div>

          <div className="space-y-4">
            {pedido.productos.map((producto) => (
              <div key={producto.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 transition hover:shadow-md md:flex-row md:items-center">
                <div className="shrink-0">
                  {producto.imagenUrl ? (
                    <img
                      src={producto.imagenUrl}
                      alt={producto.nombreProducto}
                      className="h-24 w-24 rounded-xl border border-slate-200 object-contain bg-white p-1"
                      width="96"
                      height="96"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (!e.currentTarget.src.endsWith('/placeholder.webp')) {
                          e.currentTarget.src = "/placeholder.webp";
                        }
                      }}
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-slate-100">
                      <Package size={32} className="text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="grow">
                  <h3 className="text-lg font-extrabold text-slate-900">{producto.nombreProducto}</h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <Store size={14} />
                    {producto.nombreProveedor}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">Cantidad: {producto.cantidad}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">P. unitario: {money(producto.precioUnitario)}</span>
                  </div>
                </div>

                <div className="shrink-0 rounded-2xl bg-slate-50 px-5 py-3 text-right ring-1 ring-slate-200">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subtotal</p>
                  <p className="text-xl font-extrabold text-slate-900">{money(producto.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/Catalogo" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-8 py-3 font-bold text-white transition hover:bg-[#0B2C4D]">
            <Package size={18} />
            Seguir comprando
          </Link>
          <button onClick={descargarBoleta} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-700 px-8 py-3 font-bold text-blue-700 transition hover:bg-blue-50">
            <Download size={18} />
            Descargar boleta
          </button>
        </div>
      </div>
    </div>
  );
}
