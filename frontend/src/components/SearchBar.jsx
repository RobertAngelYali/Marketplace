// SearchBar.jsx - Componente independiente para la búsqueda
import { useState, useEffect, useRef } from "react";
import { Search, X } from "./Icons";
import { getImageSrcSet, getOptimizedImageUrl, getOriginalImageUrl, suggestionImageSizes } from "../utils/imageUtils";

export default function SearchBar({ productoService, onNavigate }) {
  const [query, setQuery] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [productosTodos, setProductosTodos] = useState([]);
  const searchRef = useRef(null);
  const productosCargadosRef = useRef(false);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cargarProductos = async () => {
    if (productosCargadosRef.current) return productosTodos;

    try {
      setCargando(true);
      const response = await productoService.obtenerProductosPublicos();
      const productosData = response.data || response;
      const lista = Array.isArray(productosData) ? productosData : [];
      setProductosTodos(lista);
      productosCargadosRef.current = true;
      return lista;
    } catch (error) {
      console.error("Error al cargar productos:", error);
      return [];
    } finally {
      setCargando(false);
    }
  };

  // Buscar productos en tiempo real
  const buscarProductos = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSugerencias([]);
      return;
    }

    const productosBase = productosCargadosRef.current ? productosTodos : await cargarProductos();
    const queryLower = searchQuery.toLowerCase().trim();

    const resultados = productosBase.filter((producto) => {
      const nombreMatch = producto.nombre?.toLowerCase().includes(queryLower);
      const categoriaMatch = producto.categoriaNombre?.toLowerCase().includes(queryLower);
      const subcategoriaMatch = producto.subcategoriaNombre?.toLowerCase().includes(queryLower);
      const empresaMatch = producto.nombreEmpresa?.toLowerCase().includes(queryLower);
      return nombreMatch || categoriaMatch || subcategoriaMatch || empresaMatch;
    });

    setSugerencias(resultados.slice(0, 8));
  };

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        buscarProductos(query);
        setMostrarSugerencias(true);
      } else {
        setSugerencias([]);
        setMostrarSugerencias(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, productosTodos]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setMostrarSugerencias(false);
    if (onNavigate) {
      onNavigate(`/catalogo?search=${encodeURIComponent(query)}`);
    } else {
      window.location.href = `/catalogo?search=${encodeURIComponent(query)}`;
    }
  };

  const handleProductoClick = (productoId) => {
    setMostrarSugerencias(false);
    setQuery("");
    if (onNavigate) {
      onNavigate(`/vista_producto?id=${productoId}`);
    } else {
      window.location.href = `/vista_producto?id=${productoId}`;
    }
  };

  const limpiarBusqueda = () => {
    setQuery("");
    setSugerencias([]);
    setMostrarSugerencias(false);
  };

  const resaltarTexto = (texto, busqueda) => {
    if (!busqueda.trim() || !texto) return texto;
    
    const regex = new RegExp(`(${busqueda.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const partes = texto.split(regex);
    
    return partes.map((parte, index) => 
      regex.test(parte) ? (
        <span key={index} className="bg-yellow-200 font-semibold">
          {parte}
        </span>
      ) : (
        parte
      )
    );
  };

  return (
    <div className="relative flex-1" ref={searchRef}>
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
          size={18} 
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setMostrarSugerencias(true)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
          placeholder="Buscar productos, marcas, categorías..."
          className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={limpiarBusqueda}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Panel de sugerencias */}
      {mostrarSugerencias && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          {cargando ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm">Buscando...</p>
            </div>
          ) : sugerencias.length > 0 ? (
            <>
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-600 font-semibold">
                  {sugerencias.length} producto{sugerencias.length !== 1 ? 's' : ''} encontrado{sugerencias.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="py-2">
                {sugerencias.map((producto) => (
                  <button
                    key={producto.id}
                    onClick={() => handleProductoClick(producto.id)}
                    className="w-full px-4 py-3 hover:bg-blue-50 transition flex items-center gap-3 text-left"
                  >
                    <img
                      src={getOptimizedImageUrl(getOriginalImageUrl(producto), 60, 60)}
                      srcSet={getImageSrcSet(getOriginalImageUrl(producto), [60, 120])}
                      sizes={suggestionImageSizes}
                      alt={producto.nombre}
                      className="w-12 h-12 object-contain rounded bg-white p-1 border border-slate-100"
                      width="60"
                      height="60"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (!e.currentTarget.src.endsWith('/placeholder.webp')) {
                          e.currentTarget.src = '/placeholder.webp';
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
                        {resaltarTexto(producto.nombre, query)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {producto.categoriaNombre}
                        {producto.subcategoriaNombre && ` • ${producto.subcategoriaNombre}`}
                      </p>
                      <p className="text-sm font-semibold text-blue-600 mt-1">
                        S/ {parseFloat(producto.precioUnitario).toFixed(2)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={handleSubmit}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Ver todos los resultados →
                </button>
              </div>
            </>
          ) : query ? (
            <div className="p-6 text-center text-gray-500">
              <p className="text-sm">No se encontraron productos</p>
              <p className="text-xs mt-1">Intenta con otros términos de búsqueda</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}