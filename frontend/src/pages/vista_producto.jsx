import React, { useState, useEffect } from "react";
import { ChevronLeft, Heart, ChevronUp, ShoppingCart, PackagePlus, AlertTriangle, Star, MessageCircle, UserRound } from "lucide-react";
import productoService from "../services/productoService";
import { useCart } from "../context/CartContext";
import authService from "../services/authService";
import solicitudStockService from "../services/solicitudStockService";
import resenaService from "../services/resenaService";
import favoritoService from "../services/favoritoService";
import toast from "react-hot-toast";
import { getImageSrcSet, getOptimizedImageUrl } from "../utils/imageUtils";

export default function VistaProducto() {
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [imagenActual, setImagenActual] = useState(0);
  const [tabActivo, setTabActivo] = useState("especificaciones");
  const [cantidad, setCantidad] = useState("1");
  const [agregando, setAgregando] = useState(false);
  const [mensajeSolicitudStock, setMensajeSolicitudStock] = useState("");
  const [enviandoSolicitudStock, setEnviandoSolicitudStock] = useState(false);
  const [resenas, setResenas] = useState([]);
  const [cargandoResenas, setCargandoResenas] = useState(false);
  const [comentario, setComentario] = useState("");
  const [calificacion, setCalificacion] = useState(5);
  const [enviandoResena, setEnviandoResena] = useState(false);
  const [esFavorito, setEsFavorito] = useState(false);
  const [actualizandoFavorito, setActualizandoFavorito] = useState(false);

  // Hook del carrito
  const { addToCart } = useCart();

  useEffect(() => {
    cargarProducto();
  }, [window.location.search]);

  useEffect(() => {
    const syncFavorito = () => {
      if (producto?.id) {
        cargarEstadoFavorito(producto.id);
      } else {
        setEsFavorito(false);
      }
    };

    window.addEventListener(authService.AUTH_CHANGE_EVENT, syncFavorito);
    window.addEventListener("storage", syncFavorito);

    return () => {
      window.removeEventListener(authService.AUTH_CHANGE_EVENT, syncFavorito);
      window.removeEventListener("storage", syncFavorito);
    };
  }, [producto?.id]);

  const cargarProducto = async () => {
    try {
      setCargando(true);
      // Obtener ID del producto de los parámetros de la URL
      const params = new URLSearchParams(window.location.search);
      const productoId = params.get("id");

      if (!productoId) {
        toast.error("Producto no encontrado");
        setTimeout(() => {
          window.location.href = "/catalogo";
        }, 1000);
        return;
      }

      const productoResponse = await productoService.obtenerProductoPublicoPorId(productoId);
      const productoEncontrado = productoResponse.data || productoResponse;

      if (productoEncontrado?.id) {
        setProducto(productoEncontrado);
        setCantidad(String(productoEncontrado.cantidadMinima || 1));
        cargarResenas(productoEncontrado.id);
        cargarEstadoFavorito(productoEncontrado.id);
      } else {
        toast.error("Producto no encontrado");
        setTimeout(() => {
          window.location.href = "/catalogo";
        }, 1000);
      }
    } catch (error) {
      console.error("Error en cargarProducto:", error);
      toast.error("Error al cargar el producto");
    } finally {
      setCargando(false);
    }
  };

  const irAtras = () => {
    window.history.back();
  };

  const cargarResenas = async (productoId) => {
    try {
      setCargandoResenas(true);
      const response = await resenaService.listarPorProducto(productoId);
      const data = response.data || response;
      setResenas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar comentarios:", error);
      setResenas([]);
    } finally {
      setCargandoResenas(false);
    }
  };


  const cargarEstadoFavorito = async (productoId) => {
    try {
      if (!authService.isAuthenticated() || authService.getUserRole() !== "usuario") {
        setEsFavorito(false);
        return;
      }

      const response = await favoritoService.verificar(productoId);
      setEsFavorito(Boolean(response.data));
    } catch (error) {
      console.error("Error al verificar favorito:", error);
      setEsFavorito(false);
    }
  };

  const handleToggleFavorito = async () => {
    if (!producto) return;

    if (!authService.isAuthenticated()) {
      toast.error("Inicia sesión para guardar este producto en favoritos");
      window.dispatchEvent(new Event("open-login-modal"));
      return;
    }

    if (authService.getUserRole() !== "usuario") {
      toast.error("Solo los usuarios compradores pueden guardar favoritos");
      return;
    }

    try {
      setActualizandoFavorito(true);
      const response = await favoritoService.toggle(producto.id);
      const data = response.data || response;
      const quedoFavorito = Boolean(data.favorito);
      setEsFavorito(quedoFavorito);
      toast.success(quedoFavorito ? "Producto agregado a favoritos" : "Producto eliminado de favoritos");
    } catch (error) {
      console.error("Error al actualizar favorito:", error);
      toast.error(error.message || "No se pudo actualizar favorito");
    } finally {
      setActualizandoFavorito(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";
    try {
      return new Date(fecha).toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Fecha no disponible";
    }
  };

  const renderEstrellas = (valor, interactive = false) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const activa = starValue <= valor;
      return (
        <button
          key={starValue}
          type="button"
          onClick={() => interactive && setCalificacion(starValue)}
          disabled={!interactive || enviandoResena}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition`}
          aria-label={`${starValue} estrella${starValue > 1 ? "s" : ""}`}
        >
          <Star
            size={22}
            className={activa ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        </button>
      );
    });
  };

  const handlePublicarComentario = async () => {
    try {
      if (!authService.isAuthenticated()) {
        toast.error("Debes iniciar sesión para publicar un comentario");
        return;
      }

      const comentarioLimpio = comentario.trim();
      if (!comentarioLimpio) {
        toast.error("Escribe tu comentario antes de publicarlo");
        return;
      }

      if (comentarioLimpio.length < 3) {
        toast.error("El comentario debe tener al menos 3 caracteres");
        return;
      }

      if (comentarioLimpio.length > 500) {
        toast.error("El comentario no debe superar los 500 caracteres");
        return;
      }

      setEnviandoResena(true);
      await resenaService.crear(producto.id, {
        calificacion,
        comentario: comentarioLimpio,
      });

      toast.success("Comentario publicado correctamente");
      setComentario("");
      setCalificacion(5);
      await cargarResenas(producto.id);
    } catch (error) {
      console.error("Error al publicar comentario:", error);
      toast.error(error.message || "No se pudo publicar el comentario");
    } finally {
      setEnviandoResena(false);
    }
  };

  const obtenerCantidadNumerica = () => {
    const valor = parseInt(cantidad, 10);
    return Number.isNaN(valor) ? 0 : valor;
  };

  const normalizarCantidad = () => {
    if (!producto) return;
    const minima = producto.cantidadMinima || 1;
    const valor = obtenerCantidadNumerica();

    if (!cantidad || valor < minima) {
      setCantidad(String(minima));
      toast.error(`Cantidad mínima de compra: ${minima}`);
      return;
    }

    setCantidad(String(valor));
  };

  // Función para incrementar cantidad
  const handleIncrementar = () => {
    if (!producto) return;
    const minima = producto.cantidadMinima || 1;
    const valorActual = obtenerCantidadNumerica();
    const base = valorActual > 0 ? valorActual : minima;
    setCantidad(String(base + 1));
  };

  // Función para decrementar cantidad
  const handleDecrementar = () => {
    if (!producto) return;

    const minima = producto.cantidadMinima || 1;
    const valorActual = obtenerCantidadNumerica();

    if (valorActual <= minima) {
      toast.error(`Cantidad mínima de compra: ${minima}`);
      setCantidad(String(minima));
      return;
    }

    setCantidad(String(valorActual - 1));
  };

  // Función para manejar cambio manual de cantidad sin bloquear la edición.
  // Esto permite borrar el valor mínimo y escribir, por ejemplo, 10 sin que se forme 210.
  const handleCambioCantidad = (e) => {
    const valor = e.target.value.replace(/[^0-9]/g, "");
    setCantidad(valor);

    if (!producto || valor === "") return;

    const cantidadDigitada = parseInt(valor, 10);
    if (cantidadDigitada > producto.stockDisponible) {
      toast.error("No hay stock suficiente. Puedes enviar una solicitud mayorista al administrador.");
    }
  };

  // Función principal para agregar al carrito
  const handleAgregarAlCarrito = async () => {
    try {
      // Verificar autenticación
      if (!authService.isAuthenticated()) {
        toast.error("Debes iniciar sesión para agregar productos al carrito");
        // Opcional: redirigir al login o mostrar modal
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
        return;
      }

      // Verificar que el producto esté disponible
      if (!producto.disponible) {
        toast.error("Este producto no está disponible");
        return;
      }

      // Validar cantidad mínima
      const minima = producto.cantidadMinima || 1;
      const cantidadNumerica = obtenerCantidadNumerica();

      if (!cantidad || cantidadNumerica <= 0) {
        toast.error("Ingresa una cantidad válida");
        setCantidad(String(minima));
        return;
      }

      if (cantidadNumerica < minima) {
        toast.error(`La cantidad mínima de compra es ${minima}`);
        return;
      }

      // Validar stock
      if (cantidadNumerica > producto.stockDisponible) {
        toast.error("Stock insuficiente. Usa la opción 'Solicitar compra mayorista'.");
        return;
      }

      setAgregando(true);

      // Usar la función del context
      const success = await addToCart(producto.id, cantidadNumerica);

      if (success) {
        // Opcional: resetear cantidad a la mínima
        setCantidad(String(producto.cantidadMinima || 1));
      }

    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      toast.error(error.message || "Error al agregar al carrito");
    } finally {
      setAgregando(false);
    }
  };


  const handleSolicitarStock = async () => {
    try {
      if (!authService.isAuthenticated()) {
        toast.error("Debes iniciar sesión para enviar una solicitud");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
        return;
      }

      if (!producto) return;

      const cantidadNumerica = obtenerCantidadNumerica();
      if (cantidadNumerica <= producto.stockDisponible) {
        toast.error("La cantidad solicitada debe superar el stock disponible");
        return;
      }

      setEnviandoSolicitudStock(true);

      await solicitudStockService.crearSolicitud({
        productoId: producto.id,
        cantidadSolicitada: cantidadNumerica,
        mensaje: mensajeSolicitudStock || `Solicito ${cantidadNumerica} ${producto.unidadMedida} de ${producto.nombre}.`,
      });

      toast.success("Solicitud enviada al administrador");
      setMensajeSolicitudStock("");
    } catch (error) {
      console.error("Error al enviar solicitud de stock:", error);
      toast.error(error.message || "Error al enviar solicitud");
    } finally {
      setEnviandoSolicitudStock(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Producto no encontrado</p>
          <button
            onClick={() => (window.location.href = "/catalogo")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-[#0B2C4D]"
          >
            Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  const imagenes = producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes : [];
  const imagenPrincipal =
    imagenes.length > 0
      ? imagenes[imagenActual]?.urlImagen
      : "/placeholder.webp";

  const cantidadNumerica = obtenerCantidadNumerica();
  const promedioVisual = resenas.length > 0
    ? resenas.reduce((total, item) => total + (Number(item.calificacion) || 0), 0) / resenas.length
    : Number(producto.calificacionPromedio || 0);
  const promedioEntero = Math.round(promedioVisual);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con botón atrás */}
      <div className="bg-white border-b border-gray-200 p-4 sticky">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={irAtras}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Volver atrás"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 flex-1">
            {producto.nombre}
          </h1>
          <button
            onClick={handleToggleFavorito}
            disabled={actualizandoFavorito}
            className={`p-2 rounded-lg transition flex items-center gap-2 ${
              esFavorito
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "hover:bg-gray-100 text-gray-700 hover:text-red-600"
            } disabled:opacity-60`}
            title={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
            aria-label={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            {actualizandoFavorito ? (
              <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart size={24} className={esFavorito ? "fill-red-600" : ""} />
            )}
            <span className="hidden sm:inline text-sm font-semibold">
              {esFavorito ? "Guardado" : "Guardar"}
            </span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sección de imágenes */}
          <div className="flex flex-col gap-4 items-center justify-center">
            {/* Imagen principal */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md w-full flex items-center justify-center mt-12">
              <img
                src={getOptimizedImageUrl(imagenPrincipal, 700, 700)}
                srcSet={getImageSrcSet(imagenPrincipal, [400, 700, 1000])}
                sizes="(min-width: 1024px) 45vw, 92vw"
                alt={producto.nombre}
                className="w-full h-auto max-h-96 object-contain bg-white p-4"
                width="600"
                height="600"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                onError={(e) => {
                  if (!e.currentTarget.src.endsWith('/placeholder.webp')) {
                    e.currentTarget.src = "/placeholder.webp";
                    e.currentTarget.removeAttribute("srcset");
                  }
                }}
              />
            </div>

            {/* Miniaturas */}
            {imagenes.length > 1 && (
              <div className="flex gap-3 overflow-x-auto w-full justify-center">
                {imagenes.map((imagen, index) => (
                  <button
                    key={index}
                    onClick={() => setImagenActual(index)}
                    className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      imagenActual === index
                        ? "border-blue-600"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={getOptimizedImageUrl(imagen.urlImagen, 120, 120)}
                      srcSet={getImageSrcSet(imagen.urlImagen, [80, 160])}
                      sizes="80px"
                      alt={`${producto.nombre} ${index + 1}`}
                      className="w-full h-full object-contain bg-white p-1"
                      width="80"
                      height="80"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (!e.currentTarget.src.endsWith('/placeholder.webp')) {
                          e.currentTarget.src = "/placeholder.webp";
                          e.currentTarget.removeAttribute("srcset");
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sección de información */}
          <div className="flex flex-col gap-6">
            {/* Categoría y rating */}
            <div>
              <p className="text-sm text-gray-500 mb-2">
                {producto.categoriaNombre || "Categoría"}
                {producto.subcategoriaNombre && ` • ${producto.subcategoriaNombre}`}
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {producto.nombre}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-lg">
                  {"★".repeat(promedioEntero)}
                  {"☆".repeat(5 - promedioEntero)}
                </span>
                <span className="text-gray-600">
                  {promedioVisual ? promedioVisual.toFixed(1) : "0.0"} ({resenas.length})
                </span>
              </div>
            </div>

            {/* Proveedor */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Proveedor</p>
              <p className="text-lg font-semibold text-gray-900">
                {producto.nombreEmpresa || "Proveedor"}
              </p>
            </div>

            {/* Precio y disponibilidad */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-blue-600 font-bold mb-1">
                Precio Online
              </p>
              <p className="text-4xl font-bold text-blue-600 mb-4">
                S/ {parseFloat(producto.precioUnitario).toFixed(2)}
              </p>

              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-semibold">
                  ✓ Envío rápido disponible
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Disponibilidad</p>
                  <p className={`font-semibold ${
                    producto.disponible ? "text-green-600" : "text-red-600"
                  }`}>
                    {producto.disponible ? "En stock" : "No disponible"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Unidad de medida</p>
                  <p className="font-semibold">{producto.unidadMedida}</p>
                </div>
              </div>

              {/* Info de cantidad mínima y stock */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-700">Cantidad mínima:</span>
                  <span className="font-semibold text-blue-900">
                    {producto.cantidadMinima} {producto.unidadMedida}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-blue-700">Stock disponible:</span>
                  <span className="font-semibold text-blue-900">
                    {producto.stockDisponible} {producto.unidadMedida}
                  </span>
                </div>
              </div>

              {/* Cantidad */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2 font-semibold">Cantidad</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDecrementar}
                    disabled={cantidadNumerica <= (producto.cantidadMinima || 1)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cantidad}
                    onChange={handleCambioCantidad}
                    onBlur={normalizarCantidad}
                    placeholder={String(producto.cantidadMinima || 1)}
                    className="w-20 text-center border border-gray-300 rounded-lg py-2 font-semibold"
                  />
                  <button
                    onClick={handleIncrementar}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold"
                  >
                    +
                  </button>
                  <span className="text-sm text-gray-600 ml-2">
                    {producto.unidadMedida}
                  </span>
                </div>

                {cantidadNumerica > producto.stockDisponible && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 text-sm text-yellow-800">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    <span>
                      La cantidad supera el stock disponible. Puedes enviar una solicitud mayorista al administrador para que gestione la reposición.
                    </span>
                  </div>
                )}
              </div>

              {/* Botón de compra */}
              <button
                onClick={handleAgregarAlCarrito}
                disabled={!producto.disponible || agregando}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-[#0B2C4D] transition text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {agregando ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Agregando...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    <span>
                      {producto.disponible 
                        ? `Agregar al Carrito (${cantidad || 0})`
                        : "No disponible"
                      }
                    </span>
                  </>
                )}
              </button>

              {cantidadNumerica > producto.stockDisponible && producto.disponible && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2 text-yellow-900 font-bold">
                    <PackagePlus size={20} />
                    <span>Solicitar compra mayorista</span>
                  </div>
                  <p className="text-sm text-yellow-800 mb-3">
                    Tu solicitud llegará al administrador para que pueda coordinar con el proveedor o aumentar el stock.
                  </p>
                  <textarea
                    value={mensajeSolicitudStock}
                    onChange={(e) => setMensajeSolicitudStock(e.target.value)}
                    className="w-full border border-yellow-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-yellow-500 focus:outline-none mb-3"
                    rows="3"
                    placeholder="Mensaje opcional. Ejemplo: Necesito esta cantidad para una compra mayorista esta semana."
                  />
                  <button
                    onClick={handleSolicitarStock}
                    disabled={enviandoSolicitudStock}
                    className="w-full py-2.5 bg-yellow-500 text-yellow-950 font-bold rounded-lg hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {enviandoSolicitudStock ? "Enviando solicitud..." : "Enviar solicitud al administrador"}
                  </button>
                </div>
              )}

              {/* Subtotal */}
              {producto.disponible && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subtotal:</span>
                    <span className="text-xl font-bold text-gray-900">
                      S/ {(parseFloat(producto.precioUnitario) * cantidadNumerica).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs de información */}
        <div className="mt-12 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 flex">
            <button
              onClick={() => setTabActivo("especificaciones")}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                tabActivo === "especificaciones"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Especificaciones
            </button>
            <button
              onClick={() => setTabActivo("descripcion")}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                tabActivo === "descripcion"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Descripción
            </button>
          </div>

          <div className="p-6">
            {tabActivo === "especificaciones" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">
                      Tipo de Producto
                    </p>
                    <p className="text-gray-900">
                      {producto.categoriaNombre || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">
                      Unidad de Medida
                    </p>
                    <p className="text-gray-900">{producto.unidadMedida}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">
                      Cantidad Mínima
                    </p>
                    <p className="text-gray-900">{producto.cantidadMinima}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">
                      Stock Disponible
                    </p>
                    <p className="text-gray-900">{producto.stockDisponible}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {producto.descripcion || "No hay descripción disponible"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Comentarios */}
        <div className="mt-12 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 p-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle size={24} className="text-blue-600" />
                Comentarios
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {resenas.length} comentario{resenas.length === 1 ? "" : "s"} sobre este producto
              </p>
            </div>
          </div>

          <div className="p-8">
            {/* Formulario para agregar comentario */}
            <div className="mb-10 p-5 rounded-xl border border-gray-200 bg-gray-50">
              {authService.isAuthenticated() ? (
                <>
                  <p className="text-sm text-gray-700 font-semibold mb-3">Deja tu comentario</p>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Calificación</p>
                    <div className="flex items-center gap-1">
                      {renderEstrellas(calificacion, true)}
                      <span className="ml-2 text-sm font-semibold text-gray-700">{calificacion}/5</span>
                    </div>
                  </div>
                  <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value.slice(0, 500))}
                    className="w-full border border-gray-300 rounded-lg p-4 mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                    rows="5"
                    placeholder="Comparte tu opinión sobre este producto..."
                    disabled={enviandoResena}
                  />
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <p className={`text-xs ${comentario.trim().length > 500 ? "text-red-600" : "text-gray-500"}`}>
                      {comentario.length}/500 caracteres
                    </p>
                    {comentario.trim().length > 0 && comentario.trim().length < 3 && (
                      <p className="text-xs text-red-600">Mínimo 3 caracteres</p>
                    )}
                  </div>
                  <button
                    onClick={handlePublicarComentario}
                    disabled={enviandoResena}
                    className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-[#0B2C4D] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enviandoResena ? "Publicando..." : "Publicar comentario"}
                  </button>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-900">Inicia sesión para comentar</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Solo los usuarios logueados pueden agregar comentarios y calificaciones.
                    </p>
                  </div>
                  <button
                    onClick={() => window.dispatchEvent(new Event("open-login-modal"))}
                    className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-[#0B2C4D] transition"
                  >
                    Iniciar sesión
                  </button>
                </div>
              )}
            </div>

            {/* Lista de comentarios */}
            <div className="border-t border-gray-200 pt-8">
              {cargandoResenas ? (
                <div className="text-center py-8 text-gray-500">Cargando comentarios...</div>
              ) : resenas.length === 0 ? (
                <div className="text-center py-8">
                  <h3 className="font-semibold text-gray-900 mb-2">No hay comentarios aún</h3>
                  <p className="text-gray-600">Sé el primero en comentar este producto.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {resenas.map((resena) => (
                    <div key={resena.id} className="border border-gray-200 rounded-xl p-5 bg-white">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                            <UserRound size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{resena.nombreUsuario || "Usuario"}</p>
                            <p className="text-xs text-gray-500">{formatearFecha(resena.fechaResena)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {renderEstrellas(resena.calificacion || 0)}
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{resena.comentario}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Botón de scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 left-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-[#0B2C4D] transition-all duration-300 hover:scale-110 z-50"
        aria-label="Volver arriba"
      >
        <ChevronUp size={24} />
      </button>
    </div>
  );
}
