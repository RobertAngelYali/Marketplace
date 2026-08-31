// Catalogo.jsx - ACTUALIZADO para soportar filtros desde URL
import React, { useState, useEffect } from "react";
import { ChevronUp, Heart } from "../components/Icons";
import { useNavigate, useLocation } from "react-router-dom";
import categoriaService from "../services/categoriaService";
import productoService from "../services/productoService";
import favoritoService from "../services/favoritoService";
import authService from "../services/authService";
import toast from "react-hot-toast";
import { getImageSrcSet, getOptimizedImageUrl, getOriginalImageUrl, productCardImageSizes } from "../utils/imageUtils";

export default function Catalogo() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados para categorías y subcategorías de la BD
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [subcategoriasFiltradas, setSubcategoriasFiltradas] = useState([]);
  
  // Estados para productos de la BD
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [filtroPrecio, setFiltroPrecio] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState("");
  const [busquedaTexto, setBusquedaTexto] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [favoritosIds, setFavoritosIds] = useState(new Set());
  const [actualizandoFavoritoId, setActualizandoFavoritoId] = useState(null);
  
  const productosPorPagina = 10;
  const imagenPlaceholder = "/placeholder.webp";

  // Cargar categorías y subcategorías al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    const syncFavoritos = () => {
      cargarFavoritos();
    };

    window.addEventListener(authService.AUTH_CHANGE_EVENT, syncFavoritos);
    window.addEventListener("storage", syncFavoritos);

    return () => {
      window.removeEventListener(authService.AUTH_CHANGE_EVENT, syncFavoritos);
      window.removeEventListener("storage", syncFavoritos);
    };
  }, []);

  // Leer parámetros de la URL y aplicar filtros
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoriaParam = params.get('categoria');
    const subcategoriaParam = params.get('subcategoria');
    const searchParam = params.get('search');

    if (categoriaParam) {
      setFiltroCategoria(categoriaParam);
    }
    if (subcategoriaParam) {
      setFiltroSubcategoria(subcategoriaParam);
    }
    if (searchParam) {
      setBusquedaTexto(searchParam);
    }
  }, [location.search]);

  // Filtrar subcategorías cuando cambia la categoría seleccionada
  useEffect(() => {
    if (filtroCategoria) {
      const categoriaSeleccionada = categorias.find(c => c.nombre === filtroCategoria);
      if (categoriaSeleccionada) {
        const subsFiltradas = subcategorias.filter(
          s => s.categoriaId === categoriaSeleccionada.id
        );
        setSubcategoriasFiltradas(subsFiltradas);
      }
    } else {
      setSubcategoriasFiltradas(subcategorias);
    }
    // Limpiar filtro de subcategoría al cambiar categoría si no viene de URL
    const params = new URLSearchParams(location.search);
    if (!params.get('subcategoria')) {
      setFiltroSubcategoria("");
    }
  }, [filtroCategoria, categorias, subcategorias, location.search]);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    aplicarFiltros();
    setPaginaActual(1);
  }, [filtroPrecio, filtroCategoria, filtroSubcategoria, busquedaTexto, productos, categorias, subcategorias]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      
      const [categoriasData, subcategoriasData, productosResponse] = await Promise.all([
        categoriaService.obtenerCategorias(),
        categoriaService.obtenerSubcategorias(),
        productoService.obtenerProductosPublicos(),
      ]);

      setCategorias(categoriasData);
      setSubcategorias(subcategoriasData);
      setSubcategoriasFiltradas(subcategoriasData);

      const productosData = productosResponse.data || productosResponse;
      
      if (Array.isArray(productosData)) {
        setProductos(productosData);
        setProductosFiltrados(productosData);
      } else {
        toast.error('Error al procesar los productos');
        console.error('Estructura inesperada:', productosResponse);
      }

      await cargarFavoritos();
      
    } catch (error) {
      toast.error('Error al cargar datos');
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
        if (quedoFavorito) {
          nuevos.add(Number(productoId));
        } else {
          nuevos.delete(Number(productoId));
        }
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

  const aplicarFiltros = () => {
    let filtrados = [...productos];

    // Filtro por búsqueda de texto
    if (busquedaTexto) {
      const busquedaLower = busquedaTexto.toLowerCase().trim();
      filtrados = filtrados.filter((p) => {
        const nombreMatch = p.nombre?.toLowerCase().includes(busquedaLower);
        const categoriaMatch = p.categoriaNombre?.toLowerCase().includes(busquedaLower);
        const subcategoriaMatch = p.subcategoriaNombre?.toLowerCase().includes(busquedaLower);
        const empresaMatch = p.nombreEmpresa?.toLowerCase().includes(busquedaLower);
        const descripcionMatch = p.descripcion?.toLowerCase().includes(busquedaLower);
        return nombreMatch || categoriaMatch || subcategoriaMatch || empresaMatch || descripcionMatch;
      });
    }

    // Filtro por categoría
    if (filtroCategoria) {
      const categoriaSeleccionada = categorias.find(c => c.nombre === filtroCategoria);
      if (categoriaSeleccionada) {
        filtrados = filtrados.filter((p) => p.categoriaId === categoriaSeleccionada.id);
      }
    }

    // Filtro por subcategoría
    if (filtroSubcategoria) {
      const subcategoriaSeleccionada = subcategorias.find(s => s.nombre === filtroSubcategoria);
      if (subcategoriaSeleccionada) {
        filtrados = filtrados.filter((p) => p.subcategoriaId === subcategoriaSeleccionada.id);
      }
    }

    // Filtro por precio (ordenamiento)
    if (filtroPrecio === "mayor-menor") {
      filtrados.sort((a, b) => parseFloat(b.precioUnitario) - parseFloat(a.precioUnitario));
    } else if (filtroPrecio === "menor-mayor") {
      filtrados.sort((a, b) => parseFloat(a.precioUnitario) - parseFloat(b.precioUnitario));
    }

    setProductosFiltrados(filtrados);
  };

  // Obtener nombre de categoría y subcategoría por ID
  const obtenerNombreCategoria = (categoriaId) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  const obtenerNombreSubcategoria = (subcategoriaId) => {
    const subcategoria = subcategorias.find(s => s.id === subcategoriaId);
    return subcategoria ? subcategoria.nombre : 'Sin subcategoría';
  };

  // Paginación
  const indiceUltimoProducto = paginaActual * productosPorPagina;
  const indicePrimerProducto = indiceUltimoProducto - productosPorPagina;
  const productosActuales = productosFiltrados.slice(indicePrimerProducto, indiceUltimoProducto);
  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  const cambiarPagina = (numeroPagina) => {
    setPaginaActual(numeroPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductoClick = (productoId) => {
    console.log("Click en producto:", productoId);
    navigate(`/vista_producto?id=${productoId}`);
  };

  const limpiarFiltros = () => {
    setFiltroPrecio("");
    setFiltroCategoria("");
    setFiltroSubcategoria("");
    setBusquedaTexto("");
    setSubcategoriasFiltradas(subcategorias);
    // Limpiar URL
    navigate('/catalogo', { replace: true });
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-left">
          Catálogo de Productos
        </h1>

        {/* Filtros activos - Badges */}
        {(filtroCategoria || filtroSubcategoria || busquedaTexto) && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">Filtros activos:</span>
              {filtroCategoria && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                  Categoría: {filtroCategoria}
                  <button
                    onClick={() => {
                      setFiltroCategoria("");
                      setFiltroSubcategoria("");
                    }}
                    className="ml-1 hover:bg-[#0B2C4D] rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              {filtroSubcategoria && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                  Subcategoría: {filtroSubcategoria}
                  <button
                    onClick={() => setFiltroSubcategoria("")}
                    className="ml-1 hover:bg-[#0B2C4D] rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
              {busquedaTexto && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                  Búsqueda: "{busquedaTexto}"
                  <button
                    onClick={() => setBusquedaTexto("")}
                    className="ml-1 hover:bg-[#0B2C4D] rounded-full p-0.5"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              aria-label="Ordenar productos por precio"
              value={filtroPrecio}
              onChange={(e) => setFiltroPrecio(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Ordenar por...</option>
              <option value="mayor-menor">Precio: Mayor a Menor</option>
              <option value="menor-mayor">Precio: Menor a Mayor</option>
            </select>

            <select
              aria-label="Filtrar productos por categoría"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Todas las Categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </select>

            <select
              aria-label="Filtrar productos por subcategoría"
              value={filtroSubcategoria}
              onChange={(e) => setFiltroSubcategoria(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={!filtroCategoria && subcategoriasFiltradas.length === 0}
            >
              <option value="">Todas las Subcategorías</option>
              {subcategoriasFiltradas.map((sub) => (
                <option key={sub.id} value={sub.nombre}>
                  {sub.nombre}
                </option>
              ))}
            </select>

            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-4 text-gray-600">
          Mostrando {productosActuales.length} de {productosFiltrados.length} productos
        </div>

        {/* Grid de productos */}
        {productosActuales.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron productos con los filtros seleccionados</p>
            <button
              onClick={limpiarFiltros}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-[#0B2C4D] transition"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
            {productosActuales.map((producto, index) => {
              const imagenProducto = getOriginalImageUrl(producto);

              return (
              <div
                key={producto.id}
                onClick={() => handleProductoClick(producto.id)}
                className="bg-white shadow-md rounded-xl p-4 hover:shadow-lg transition cursor-pointer flex flex-col h-full relative"
                style={index > 5 ? { contentVisibility: "auto", containIntrinsicSize: "320px" } : undefined}
              >
                {/* Badge de descuento si existe */}
                {producto.descuentoPorcentaje && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    -{producto.descuentoPorcentaje}%
                  </span>
                )}
                <button
                  onClick={(e) => handleToggleFavorito(e, producto.id)}
                  disabled={actualizandoFavoritoId === producto.id}
                  className={`absolute top-2 right-2 z-20 w-10 h-10 rounded-full shadow-md flex items-center justify-center transition ${
                    esFavorito(producto.id)
                      ? "bg-red-50 text-red-600 border border-red-100"
                      : "bg-white text-gray-500 hover:text-red-600 hover:bg-red-50"
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
                  src={getOptimizedImageUrl(imagenProducto, 400, 300)}
                  srcSet={getImageSrcSet(imagenProducto)}
                  sizes={productCardImageSizes}
                  alt={producto.nombre}
                  className="rounded-lg mb-3 w-full h-48 object-contain bg-white p-2 border border-slate-100"
                  width="400"
                  height="300"
                  loading={index < 3 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                  onError={(e) => {
                    if (!e.currentTarget.src.endsWith(imagenPlaceholder)) {
                      e.currentTarget.src = imagenPlaceholder;
                      e.currentTarget.removeAttribute("srcset");
                    }
                  }}
                />
                <div className="flex flex-col flex-1 w-full">
                  <p className="text-xs text-gray-500 mb-2">
                    {producto.categoriaNombre || obtenerNombreCategoria(producto.categoriaId)}
                    {producto.subcategoriaNombre && ` • ${producto.subcategoriaNombre}`}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
                    {producto.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    por {producto.nombreEmpresa || 'Proveedor'}
                  </p>
                  {/* Precios alineados, colores originales */}
                  <div className="mb-2">
                    <span className="block text-xs text-blue-600 font-bold">Precio Online</span>
                    <span className="block text-xl font-bold text-blue-600">
                      S/ {parseFloat(producto.precioUnitario).toFixed(2)}
                    </span>
                    {/* Precio regular tachado si existe producto.precioRegular */}
                    {producto.precioRegular && (
                      <span className="block text-xs text-gray-500 line-through">S/ {parseFloat(producto.precioRegular).toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-yellow-400 text-sm">
                      {"★".repeat(Math.floor(producto.calificacionPromedio || 3))}
                      {"☆".repeat(5 - Math.floor(producto.calificacionPromedio || 3))}
                    </span>
                    <span className="text-xs text-gray-600">
                      ({Math.floor(producto.calificacionPromedio || 0)})
                    </span>
                  </div>
                  <div className="grow"></div>
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-[#0B2C4D] transition text-sm mt-auto">
                    Añadir al carrito
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="flex justify-center mt-12 mb-8">
            <div className="flex gap-2">
              <button
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Anterior
              </button>

              {Array.from({ length: Math.min(totalPaginas, 5) }, (_, i) => {
                let pageNumber;
                if (totalPaginas <= 5) {
                  pageNumber = i + 1;
                } else if (paginaActual <= 3) {
                  pageNumber = i + 1;
                } else if (paginaActual >= totalPaginas - 2) {
                  pageNumber = totalPaginas - 4 + i;
                } else {
                  pageNumber = paginaActual - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => cambiarPagina(pageNumber)}
                    className={`px-4 py-2 rounded-lg transition ${
                      paginaActual === pageNumber
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Botón de scroll to top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 left-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-[#0B2C4D] transition-all duration-300 hover:scale-110 z-50"
          aria-label="Volver arriba"
        >
          <ChevronUp size={24} />
        </button>
      </main>
    </div>
  );
}
