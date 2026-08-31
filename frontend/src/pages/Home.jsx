// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Boxes,
  ChevronUp,
  Clock,
  CreditCard,
  Heart,
  PackagePlus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import productoService from "../services/productoService";
import favoritoService from "../services/favoritoService";
import authService from "../services/authService";
import toast from "react-hot-toast";

export default function Home() {
  const navigate = useNavigate();
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [productosNuevos, setProductosNuevos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [favoritosIds, setFavoritosIds] = useState(new Set());
  const [actualizandoFavoritoId, setActualizandoFavoritoId] = useState(null);
  const imagenPlaceholder = "/placeholder.webp";

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    const syncFavoritos = () => cargarFavoritos();
    window.addEventListener(authService.AUTH_CHANGE_EVENT, syncFavoritos);
    window.addEventListener("storage", syncFavoritos);
    return () => {
      window.removeEventListener(authService.AUTH_CHANGE_EVENT, syncFavoritos);
      window.removeEventListener("storage", syncFavoritos);
    };
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const productosResponse = await productoService.obtenerProductosPublicos();
      const productosData = productosResponse.data || productosResponse;

      if (Array.isArray(productosData)) {
        const nombresEspecificos = [
          "tomate",
          "brócoli",
          "zanahoria",
          "papa",
          "piña",
          "palta",
          "plátano",
          "detergente",
          "sal",
          "harina",
          "leche",
          "champú",
          "arroz",
          "atún",
        ];

        const productosFiltrados = productosData.filter((p) =>
          nombresEspecificos.some((nombre) =>
            p.nombre?.toLowerCase().includes(nombre.toLowerCase())
          )
        );

        const destacados =
          productosFiltrados.length > 0
            ? productosFiltrados.slice(0, 8)
            : [...productosData].sort(() => Math.random() - 0.5).slice(0, 8);

        setProductosDestacados(destacados);
        setProductosNuevos([...productosData].reverse().slice(0, 8));
        await cargarFavoritos();
      } else {
        toast.error("Error al procesar los productos");
      }
    } catch (error) {
      toast.error("Error al cargar productos");
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const cargarFavoritos = async () => {
    try {
      if (!authService.isAuthenticated() || authService.getUserRole() !== "usuario") {
        setFavoritosIds(new Set());
        return;
      }
      const response = await favoritoService.listarIds();
      const ids = response.data || response;
      setFavoritosIds(new Set(Array.isArray(ids) ? ids.map((id) => Number(id)) : []));
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
      setFavoritosIds(new Set());
    }
  };

  const esFavorito = (productoId) => favoritosIds.has(Number(productoId));

  const handleToggleFavorito = async (e, productoId) => {
    e.stopPropagation();
    if (!authService.isAuthenticated()) {
      toast.error("Inicia sesión para guardar favoritos");
      window.dispatchEvent(new Event("open-login-modal"));
      return;
    }
    if (authService.getUserRole() !== "usuario") {
      toast.error("Solo los usuarios compradores pueden guardar favoritos");
      return;
    }

    try {
      setActualizandoFavoritoId(productoId);
      const response = await favoritoService.toggle(productoId);
      const data = response.data || response;
      const quedoFavorito = Boolean(data.favorito);
      setFavoritosIds((actuales) => {
        const nuevos = new Set(actuales);
        if (quedoFavorito) nuevos.add(Number(productoId));
        else nuevos.delete(Number(productoId));
        return nuevos;
      });
      toast.success(quedoFavorito ? "Producto agregado a favoritos" : "Producto eliminado de favoritos");
    } catch (error) {
      console.error("Error al actualizar favorito:", error);
      toast.error(error.message || "No se pudo actualizar favorito");
    } finally {
      setActualizandoFavoritoId(null);
    }
  };

  const handleProductoClick = (productoId) => {
    navigate(`/vista_producto?id=${productoId}`);
  };

  const irAlCatalogo = () => {
    navigate("/catalogo");
  };

  const stockBadge = (producto) => {
    const stock = Number(producto.stockDisponible ?? 0);
    const minimo = Number(producto.stockMinimoAlerta ?? 10);

    if (stock <= 0) {
      return <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">Sin stock</span>;
    }

    if (stock <= minimo) {
      return <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Stock bajo</span>;
    }

    return null;
  };

  const renderCard = (producto, index = 0) => (
    <div
      key={producto.id}
      onClick={() => handleProductoClick(producto.id)}
      className="tdp-card tdp-card-hover overflow-hidden cursor-pointer flex flex-col h-full group"
    >
      <div className="relative bg-white overflow-hidden">
        {stockBadge(producto)}
        <button
          type="button"
          onClick={(e) => handleToggleFavorito(e, producto.id)}
          disabled={actualizandoFavoritoId === producto.id}
          className={`absolute top-3 right-3 z-20 w-10 h-10 rounded-full shadow-md flex items-center justify-center transition ${
            esFavorito(producto.id)
              ? "bg-red-50 text-red-600 border border-red-100"
              : "bg-white text-slate-500 hover:text-red-600 hover:bg-red-50"
          } disabled:opacity-60`}
          title={esFavorito(producto.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
          aria-label={esFavorito(producto.id) ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          {actualizandoFavoritoId === producto.id ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Heart size={20} className={esFavorito(producto.id) ? "fill-red-600" : ""} />
          )}
        </button>
        <img
          src={
            producto.imagenes && producto.imagenes.length > 0
              ? producto.imagenes[0].urlImagen
              : imagenPlaceholder
          }
          alt={producto.nombre}
          className="w-full h-48 object-contain bg-white p-2 transition-transform duration-300"
          width="400"
          height="300"
          loading={index < 4 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
          decoding="async"
          onError={(e) => {
            if (!e.currentTarget.src.endsWith(imagenPlaceholder)) {
              e.currentTarget.src = imagenPlaceholder;
            }
          }}
        />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">
          {producto.categoriaNombre || "Categoría"}
        </p>
        <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-2">
          {producto.nombre}
        </h3>
        <p className="text-sm text-slate-500 mb-3">
          por {producto.nombreEmpresa || "Proveedor"}
        </p>

        <div className="flex items-end justify-between gap-2 mt-auto">
          <div>
            <span className="block text-xs text-slate-500">Precio mayorista</span>
            <span className="block text-xl font-extrabold text-blue-600">
              S/ {parseFloat(producto.precioUnitario).toFixed(2)}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
            Stock: {producto.stockDisponible ?? 0}
          </span>
        </div>

        <button className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-bold flex items-center justify-center gap-2">
          <ShoppingBag size={16} /> Ver producto
        </button>
      </div>
    </div>
  );

  return (
    <main className="bg-[#F8FAFC] pb-16">
      <section className="bg-[#0B2C4D] text-white py-16 lg:py-20 overflow-hidden">
        <div className="tdp-container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-4 py-2 rounded-full text-sm font-semibold text-blue-100 mb-6">
              <Boxes size={18} /> Marketplace mayorista
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Compra productos al por mayor de forma rápida y segura
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl">
              Tienda Don Pepito conecta clientes y proveedores para gestionar pedidos, alertas de stock y solicitudes de compras grandes cuando la cantidad disponible no alcanza.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={irAlCatalogo}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center gap-2"
              >
                Ver catálogo <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("/solicitar-proveedor")}
                className="px-6 py-3 border border-white/70 text-white rounded-xl font-bold hover:bg-white/10 transition"
              >
                Ser proveedor
              </button>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="relative bg-white/10 border border-white/15 rounded-3xl p-6 shadow-2xl backdrop-blur">
              <div className="bg-white rounded-2xl p-5 text-slate-900 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-sm text-slate-500">Panel rápido</p>
                    <h3 className="text-xl font-bold text-[#0B2C4D]">Gestión mayorista</h3>
                  </div>
                  <PackagePlus className="text-blue-600" size={36} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-3xl font-extrabold text-blue-700">24</p>
                    <p className="text-sm text-slate-600">Productos activos</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-3xl font-extrabold text-blue-600">8</p>
                    <p className="text-sm text-slate-600">Alertas de stock</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                    <p className="text-3xl font-extrabold text-green-600">12</p>
                    <p className="text-sm text-slate-600">Pedidos listos</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <p className="text-3xl font-extrabold text-slate-800">5</p>
                    <p className="text-sm text-slate-600">Solicitudes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-slate-200 py-8">
        <div className="tdp-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="tdp-card p-5 flex items-center gap-4">
            <Truck className="text-blue-600" size={34} />
            <div>
              <h4 className="font-bold text-slate-900">Envío coordinado</h4>
              <p className="text-sm text-slate-500">Ideal para compras grandes</p>
            </div>
          </div>
          <div className="tdp-card p-5 flex items-center gap-4">
            <ShieldCheck className="text-green-600" size={34} />
            <div>
              <h4 className="font-bold text-slate-900">Compra segura</h4>
              <p className="text-sm text-slate-500">Usuarios y proveedores controlados</p>
            </div>
          </div>
          <div className="tdp-card p-5 flex items-center gap-4">
            <PackagePlus className="text-blue-500" size={34} />
            <div>
              <h4 className="font-bold text-slate-900">Solicitud mayorista</h4>
              <p className="text-sm text-slate-500">Pide más si no hay stock</p>
            </div>
          </div>
          <div className="tdp-card p-5 flex items-center gap-4">
            <Clock className="text-blue-600" size={34} />
            <div>
              <h4 className="font-bold text-slate-900">Gestión rápida</h4>
              <p className="text-sm text-slate-500">Alertas para admin y proveedor</p>
            </div>
          </div>
        </div>
      </section>

      <section className="tdp-container py-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <span className="text-blue-600 font-bold text-sm uppercase tracking-wide">Recomendados</span>
            <h2 className="tdp-section-title mt-1">Productos destacados</h2>
            <p className="tdp-muted mt-2">Seleccionados para compras frecuentes y pedidos mayoristas.</p>
          </div>
          <button onClick={irAlCatalogo} className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-2">
            Ver todos <ArrowRight size={18} />
          </button>
        </div>

        {cargando ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Cargando productos...</p>
          </div>
        ) : productosDestacados.length === 0 ? (
          <div className="text-center py-12 tdp-card">
            <p className="text-slate-500 text-lg">No hay productos destacados disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productosDestacados.map((producto) => renderCard(producto))}
          </div>
        )}
      </section>

      <section className="tdp-container pb-14">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <span className="text-blue-600 font-bold text-sm uppercase tracking-wide">Ventajas</span>
              <h2 className="tdp-section-title mt-1">Pensado para compras al por mayor</h2>
              <p className="tdp-muted mt-3">Administra productos, pedidos y solicitudes con una experiencia clara y profesional.</p>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                <TrendingUp className="text-blue-600 mb-3" />
                <h3 className="font-bold text-slate-900">Precios mayoristas</h3>
                <p className="text-sm text-slate-500 mt-2">Productos organizados para clientes que compran en volumen.</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                <CreditCard className="text-green-600 mb-3" />
                <h3 className="font-bold text-slate-900">Pedidos simples</h3>
                <p className="text-sm text-slate-500 mt-2">Carrito, checkout y seguimiento de pedidos en un solo flujo.</p>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                <PackagePlus className="text-blue-500 mb-3" />
                <h3 className="font-bold text-slate-900">Stock gestionable</h3>
                <p className="text-sm text-slate-500 mt-2">Solicitudes al administrador cuando el stock disponible no alcanza.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tdp-container pb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <span className="text-blue-600 font-bold text-sm uppercase tracking-wide">Últimos productos</span>
            <h2 className="tdp-section-title mt-1">Recién agregados</h2>
          </div>
          <button onClick={irAlCatalogo} className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-2">
            Ir al catálogo <ArrowRight size={18} />
          </button>
        </div>

        {cargando ? (
          <p className="text-center text-slate-500">Actualizando catálogo...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productosNuevos.map((producto) => renderCard(producto))}
          </div>
        )}
      </section>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 left-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:scale-110 z-50"
        aria-label="Volver arriba"
      >
        <ChevronUp size={24} />
      </button>
    </main>
  );
}
