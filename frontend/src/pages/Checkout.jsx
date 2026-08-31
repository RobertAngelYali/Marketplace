import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  CreditCard,
  Smartphone,
  Wallet,
  MapPin,
  Phone,
  User,
  ArrowLeft,
  CheckCircle,
  Package,
  Download,
  FileText,
  Home,
  ShoppingBag,
} from "lucide-react";
import cartService from "../services/cartService";
import authService from "../services/authService";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { onlyDigits } from "../utils/formValidation";

export default function Checkout() {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [errors, setErrors] = useState({});
  const [compraConfirmada, setCompraConfirmada] = useState(null);
  const { refreshCount } = useCart();

  // Datos de entrega (se guardan en BD)
  const [datosEntrega, setDatosEntrega] = useState({
    direccionEntrega: "",
    telefonoContacto: "",
    metodoPago: "", // TARJETA, YAPE, EFECTIVO
  });

  // Datos de tarjeta (solo frontend, no se guardan)
  const [datosTarjeta, setDatosTarjeta] = useState({
    numeroTarjeta: "",
    nombreTitular: "",
    fechaVencimiento: "",
    cvv: "",
  });

  // Estado para controlar si el pago con Yape fue completado
  const [pagoYapeCompletado, setPagoYapeCompletado] = useState(false);

  useEffect(() => {
    cargarCarrito();
  }, []);

  const cargarCarrito = async () => {
    try {
      setLoading(true);
      const response = await cartService.obtenerCarrito();
      
      if (!response.data || response.data.items.length === 0) {
        await refreshCount();
        toast.error("Tu carrito está vacío");
        navigate("/carrito");
        return;
      }
      
      setCarrito(response.data);
    } catch (error) {
      console.error("Error al cargar carrito:", error);
      toast.error("Error al cargar el carrito");
      navigate("/carrito");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors[field] ? "border-red-500 bg-red-50" : "border-gray-300"}`;

  const clearError = (field) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validarDatosEntrega = () => {
    const nuevosErrores = {};
    if (!datosEntrega.direccionEntrega.trim()) nuevosErrores.direccionEntrega = "Ingresa tu dirección de entrega";
    if (!datosEntrega.telefonoContacto.trim()) nuevosErrores.telefonoContacto = "Ingresa tu teléfono de contacto";
    else if (datosEntrega.telefonoContacto.length !== 9) nuevosErrores.telefonoContacto = "El teléfono debe tener exactamente 9 dígitos";
    if (!datosEntrega.metodoPago) nuevosErrores.metodoPago = "Selecciona un método de pago";

    setErrors((prev) => ({ ...prev, ...nuevosErrores }));
    if (Object.keys(nuevosErrores).length > 0) {
      toast.error("Completa o corrige los datos de entrega");
      return false;
    }
    return true;
  };

  const obtenerErrorFechaVencimiento = (fecha) => {
    const fechaLimpia = fecha.trim();

    if (!fechaLimpia) return "Ingresa la fecha de vencimiento";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(fechaLimpia)) return "Usa el formato MM/AA";

    const [mesTexto, anioTexto] = fechaLimpia.split("/");
    const mes = Number(mesTexto);
    const anio = 2000 + Number(anioTexto);
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1;

    // La tarjeta es válida hasta el último día del mes impreso.
    // Ejemplo: 07/26 sigue activa durante todo julio de 2026.
    if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
      return "La tarjeta está vencida";
    }

    return "";
  };

  const validarDatosTarjeta = () => {
    const nuevosErrores = {};
    const numero = datosTarjeta.numeroTarjeta.replace(/\s/g, "");
    const errorFechaVencimiento = obtenerErrorFechaVencimiento(datosTarjeta.fechaVencimiento);

    if (!numero) nuevosErrores.numeroTarjeta = "Ingresa el número de tarjeta";
    else if (!/^\d{16}$/.test(numero)) nuevosErrores.numeroTarjeta = "El número de tarjeta debe tener 16 dígitos";

    if (!datosTarjeta.nombreTitular.trim()) nuevosErrores.nombreTitular = "Ingresa el nombre del titular";

    if (errorFechaVencimiento) nuevosErrores.fechaVencimiento = errorFechaVencimiento;

    if (!datosTarjeta.cvv.trim()) nuevosErrores.cvv = "Ingresa el CVV";
    else if (!/^\d{3}$/.test(datosTarjeta.cvv)) nuevosErrores.cvv = "El CVV debe tener 3 dígitos";

    setErrors((prev) => ({ ...prev, ...nuevosErrores }));
    if (Object.keys(nuevosErrores).length > 0) {
      toast.error(nuevosErrores.fechaVencimiento || "Completa o corrige los datos de la tarjeta");
      return false;
    }
    return true;
  };

  const handleFinalizarCompra = async () => {
    // Validar datos de entrega
    if (!validarDatosEntrega()) return;

    // Validar según método de pago
    if (datosEntrega.metodoPago === "TARJETA") {
      if (!validarDatosTarjeta()) return;
      toast.success("Procesando pago con tarjeta...");
    } else if (datosEntrega.metodoPago === "YAPE") {
      if (!pagoYapeCompletado) {
        toast.error("Por favor confirma que realizaste el pago con Yape");
        return;
      }
      toast.success("Verificando pago Yape...");
    } else if (datosEntrega.metodoPago === "EFECTIVO") {
      toast.success("Procesando pedido...");
    }

    try {
      setProcesandoPago(true);

      // Simular delay de procesamiento (solo para UX)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const carritoParaBoleta = carrito;

      // Enviar solo los datos que se guardan en BD
      const pedidoCreado = await cartService.realizarPedido({
        direccionEntrega: datosEntrega.direccionEntrega,
        telefonoContacto: datosEntrega.telefonoContacto,
        metodoPago: datosEntrega.metodoPago,
      });

      await refreshCount();

      const usuarioActual = authService.getCurrentUser();
      const pedidoResumen = {
        ...pedidoCreado,
        numeroPedido: pedidoCreado?.numeroPedido || `PED-${Date.now()}`,
        fechaPedido: new Date().toISOString(),
        total: carritoParaBoleta?.subtotal || 0,
        estado: "pago_confirmado",
        direccionEntrega: datosEntrega.direccionEntrega,
        telefonoContacto: datosEntrega.telefonoContacto,
        metodoPago: datosEntrega.metodoPago,
      };

      setCompraConfirmada({
        pedido: pedidoResumen,
        carrito: carritoParaBoleta,
        datosEntrega: { ...datosEntrega },
        usuario: usuarioActual,
      });
      setProcesandoPago(false);
      toast.success("¡Pedido confirmado! Puedes descargar tu boleta cuando lo desees.");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error al procesar el pedido");
      setProcesandoPago(false);
    }
  };


  const descargarBoletaConfirmada = async () => {
    if (!compraConfirmada) return;
    const { default: boletaPdfService } = await import("../services/boletaPdfService");
    await boletaPdfService.generarBoleta(compraConfirmada);
    toast.success("Boleta generada correctamente");
  };

  const metodoPagoTexto = (metodo) => {
    if (!metodo) return "-";
    const map = { TARJETA: "Tarjeta", YAPE: "Yape/Plin", EFECTIVO: "Pago contra entrega" };
    return map[metodo] || metodo;
  };

  const formatearNumeroTarjeta = (valor) => {
    const numero = valor.replace(/\s/g, "").replace(/\D/g, "");
    const grupos = numero.match(/.{1,4}/g);
    return grupos ? grupos.join(" ") : numero;
  };

  const formatearFechaVencimiento = (valor) => {
    const limpio = valor.replace(/\D/g, "");
    if (limpio.length >= 2) {
      return limpio.slice(0, 2) + "/" + limpio.slice(2, 4);
    }
    return limpio;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {compraConfirmada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="text-green-600" size={48} />
              </div>
              <h2 className="text-3xl font-extrabold text-green-700">¡Pago confirmado!</h2>
              <p className="mt-2 text-slate-600">Tu compra se procesó correctamente. La boleta no se descarga automáticamente; puedes generarla con el botón inferior.</p>
            </div>

            <div className="mt-7 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <h3 className="mb-4 font-bold text-slate-900">Resumen de transacción</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Pedido:</span>
                  <span className="font-bold text-slate-900">#{compraConfirmada.pedido.numeroPedido}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Fecha:</span>
                  <span className="font-semibold text-slate-900">{new Date(compraConfirmada.pedido.fechaPedido).toLocaleDateString("es-PE")}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Método de pago:</span>
                  <span className="font-semibold text-slate-900">{metodoPagoTexto(compraConfirmada.datosEntrega.metodoPago)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Productos:</span>
                  <span className="font-semibold text-slate-900">{compraConfirmada.carrito?.items?.length || 0}</span>
                </div>
                <div className="border-t border-slate-200 pt-4 flex justify-between gap-4">
                  <span className="font-bold text-slate-900">Total pagado:</span>
                  <span className="text-xl font-extrabold text-blue-700">S/ {Number(compraConfirmada.pedido.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                onClick={() => navigate("/Mispedidos", { replace: true })}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 font-bold text-white shadow-lg shadow-blue-700/20 transition hover:bg-[#0B2C4D]"
              >
                <ShoppingBag size={18} />
                Mis pedidos
              </button>
              <button
                onClick={descargarBoletaConfirmada}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0B2C4D] px-4 py-3 font-bold text-white shadow-lg shadow-slate-900/20 transition hover:bg-blue-900"
              >
                <Download size={18} />
                Boleta PDF
              </button>
              <button
                onClick={() => navigate("/", { replace: true })}
                className="flex items-center justify-center gap-2 rounded-xl border border-blue-700 px-4 py-3 font-bold text-blue-700 transition hover:bg-blue-50"
              >
                <Home size={18} />
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate("/carrito")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Volver al carrito</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Finalizar Compra
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de pago */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos de Entrega */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="text-blue-600" size={24} />
                Datos de Entrega
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dirección de Entrega *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Av. Principal 123, Lima"
                    maxLength="180"
                    className={inputClass("direccionEntrega")}
                    value={datosEntrega.direccionEntrega}
                    onChange={(e) => {
                      setDatosEntrega({ ...datosEntrega, direccionEntrega: e.target.value });
                      clearError("direccionEntrega");
                    }}
                  />
                  {errors.direccionEntrega && <p className="text-xs text-red-600 mt-1">{errors.direccionEntrega}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono de Contacto *
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej: 999999999"
                    maxLength="9"
                    inputMode="numeric"
                    className={inputClass("telefonoContacto")}
                    value={datosEntrega.telefonoContacto}
                    onChange={(e) => {
                      setDatosEntrega({ ...datosEntrega, telefonoContacto: onlyDigits(e.target.value, 9) });
                      clearError("telefonoContacto");
                    }}
                  />
                  {errors.telefonoContacto ? <p className="text-xs text-red-600 mt-1">{errors.telefonoContacto}</p> : <p className="text-xs text-gray-500 mt-1">Solo 9 dígitos. No se permiten letras.</p>}
                </div>
              </div>
            </div>

            {/* Método de Pago */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wallet className="text-blue-600" size={24} />
                Método de Pago
              </h2>

              <div className="space-y-3 mb-6">
                {/* Opción: Tarjeta */}
                <button
                  onClick={() => {
                    setDatosEntrega({ ...datosEntrega, metodoPago: "TARJETA" });
                    clearError("metodoPago");
                  }}
                  className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition ${
                    datosEntrega.metodoPago === "TARJETA"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <CreditCard
                    size={24}
                    className={
                      datosEntrega.metodoPago === "TARJETA"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                  />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">
                      Tarjeta de Crédito/Débito
                    </p>
                    <p className="text-sm text-gray-500">
                      Visa, Mastercard, American Express
                    </p>
                  </div>
                </button>

                {/* Opción: Yape */}
                <button
                  onClick={() => {
                    setDatosEntrega({ ...datosEntrega, metodoPago: "YAPE" });
                    clearError("metodoPago");
                  }}
                  className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition ${
                    datosEntrega.metodoPago === "YAPE"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Smartphone
                    size={24}
                    className={
                      datosEntrega.metodoPago === "YAPE"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                  />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Yape / Plin</p>
                    <p className="text-sm text-gray-500">
                      Pago mediante código QR
                    </p>
                  </div>
                </button>

                {/* Opción: Efectivo */}
                <button
                  onClick={() => {
                    setDatosEntrega({ ...datosEntrega, metodoPago: "EFECTIVO" });
                    clearError("metodoPago");
                  }}
                  className={`w-full flex items-center gap-4 p-4 border-2 rounded-lg transition ${
                    datosEntrega.metodoPago === "EFECTIVO"
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Wallet
                    size={24}
                    className={
                      datosEntrega.metodoPago === "EFECTIVO"
                        ? "text-blue-600"
                        : "text-gray-400"
                    }
                  />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">
                      Pago contra entrega
                    </p>
                    <p className="text-sm text-gray-500">
                      Paga en efectivo al recibir
                    </p>
                  </div>
                </button>
              </div>
              {errors.metodoPago && <p className="text-xs text-red-600 mb-4">{errors.metodoPago}</p>}

              {/* Formulario de Tarjeta */}
              {datosEntrega.metodoPago === "TARJETA" && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Datos de la Tarjeta
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Tarjeta *
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      inputMode="numeric"
                      className={inputClass("numeroTarjeta")}
                      value={datosTarjeta.numeroTarjeta}
                      onChange={(e) => {
                        setDatosTarjeta({ ...datosTarjeta, numeroTarjeta: formatearNumeroTarjeta(e.target.value) });
                        clearError("numeroTarjeta");
                      }}
                    />
                    {errors.numeroTarjeta && <p className="text-xs text-red-600 mt-1">{errors.numeroTarjeta}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Titular *
                    </label>
                    <input
                      type="text"
                      placeholder="JUAN PEREZ"
                      maxLength="80"
                      className={`${inputClass("nombreTitular")} uppercase`}
                      value={datosTarjeta.nombreTitular}
                      onChange={(e) => {
                        setDatosTarjeta({ ...datosTarjeta, nombreTitular: e.target.value.toUpperCase() });
                        clearError("nombreTitular");
                      }}
                    />
                    {errors.nombreTitular && <p className="text-xs text-red-600 mt-1">{errors.nombreTitular}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Vencimiento *
                      </label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        maxLength="5"
                        inputMode="numeric"
                        className={inputClass("fechaVencimiento")}
                        value={datosTarjeta.fechaVencimiento}
                        onChange={(e) => {
                          setDatosTarjeta({ ...datosTarjeta, fechaVencimiento: formatearFechaVencimiento(e.target.value) });
                          clearError("fechaVencimiento");
                        }}
                      />
                      {errors.fechaVencimiento && <p className="text-xs text-red-600 mt-1">{errors.fechaVencimiento}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        maxLength="3"
                        inputMode="numeric"
                        className={inputClass("cvv")}
                        value={datosTarjeta.cvv}
                        onChange={(e) => {
                          setDatosTarjeta({ ...datosTarjeta, cvv: onlyDigits(e.target.value, 3) });
                          clearError("cvv");
                        }}
                      />
                      {errors.cvv && <p className="text-xs text-red-600 mt-1">{errors.cvv}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Sección de Yape */}
              {datosEntrega.metodoPago === "YAPE" && (
                <div className="mt-6 p-6 bg-linear-to-br from-purple-50 to-pink-50 rounded-lg text-center">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Escanea el código QR para pagar
                  </h3>

                  {/* Aquí va tu imagen QR */}
                  <div className="bg-white p-4 rounded-lg inline-block mb-4 shadow-md">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Commons_QR_code.png"
                      alt="Código QR Yape"
                      className="w-80 h-84 object-cover"
                      width="320"
                      height="336"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    Monto a pagar:{" "}
                    <span className="font-bold text-lg text-purple-600">
                      S/ {carrito?.subtotal.toFixed(2)}
                    </span>
                  </p>

                  <div className="bg-white p-4 rounded-lg">
                    <label className="flex items-center justify-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pagoYapeCompletado}
                        onChange={(e) =>
                          setPagoYapeCompletado(e.target.checked)
                        }
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Ya realicé el pago con Yape
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Mensaje para pago en efectivo */}
              {datosEntrega.metodoPago === "EFECTIVO" && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Pagarás en efectivo al momento de
                    recibir tu pedido. Asegúrate de tener el monto exacto.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Resumen del Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Resumen del Pedido
              </h2>

              <div className="space-y-3 mb-6">
                {carrito?.items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 pb-3 border-b border-gray-100"
                  >
                    <img
                      src={item.imagenUrl || "/placeholder.webp"}
                      alt={item.nombreProducto}
                      className="w-12 h-12 object-contain rounded bg-white p-1 border border-slate-100"
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
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.nombreProducto}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.cantidad} x S/ {item.precioUnitario.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      S/ {item.subtotal.toFixed(2)}
                    </p>
                  </div>
                ))}

                {carrito && carrito.items.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    + {carrito.items.length - 3} productos más
                  </p>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>S/ {carrito?.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-green-600 font-medium">Gratis</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-blue-600">
                    S/ {carrito?.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleFinalizarCompra}
                disabled={procesandoPago}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-[#0B2C4D] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {procesandoPago ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Confirmar Pedido
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Al confirmar aceptas nuestros términos y condiciones
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}