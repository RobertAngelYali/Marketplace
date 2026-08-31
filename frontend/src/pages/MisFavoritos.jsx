import React, { useEffect, useState } from "react";
import { Heart, ShoppingBag, Trash2, ArrowRight, ChevronUp, PackageSearch } from "lucide-react";
import { useNavigate } from "react-router-dom";
import favoritoService from "../services/favoritoService";
import toast from "react-hot-toast";

export default function MisFavoritos() {
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [eliminandoId, setEliminandoId] = useState(null);

  useEffect(() => {
    cargarFavoritos();
  }, []);

  const cargarFavoritos = async () => {
    try {
      setCargando(true);
      const response = await favoritoService.listar();
      const data = response.data || response;
      setFavoritos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
      toast.error(error.message || "No se pudieron cargar tus favoritos");
      setFavoritos([]);
    } finally {
      setCargando(false);
    }
  };

  const eliminarFavorito = async (productoId) => {
    try {
      setEliminandoId(productoId);
      await favoritoService.eliminar(productoId);
      setFavoritos((actuales) => actuales.filter((fav) => fav.productoId !== productoId));
      toast.success("Producto eliminado de favoritos");
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
      toast.error(error.message || "No se pudo eliminar el favorito");
    } finally {
      setEliminandoId(null);
    }
  };

  const obtenerImagen = (producto) => {
    return producto?.imagenes?.length > 0
      ? producto.imagenes[0].urlImagen
      : "/placeholder.webp";
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-gradient-to-r from-blue-700 to-[#0B2C4D] rounded-2xl p-8 text-white mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-sm font-semibold mb-4">
                <Heart size={16} className="fill-white" />
                Productos guardados
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Mis favoritos</h1>
              <p className="text-blue-100 max-w-2xl">
                Guarda productos que te interesan para revisarlos después y comprarlos cuando los necesites.
              </p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-xl p-4 min-w-[180px]">
              <p className="text-sm text-blue-100">Total guardados</p>
              <p className="text-4xl font-extrabold">{favoritos.length}</p>
            </div>
          </div>
        </div>

        {favoritos.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <PackageSearch size={38} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aún no tienes productos favoritos</h2>
            <p className="text-gray-600 mb-6">
              Explora el catálogo y presiona el corazón en los productos que quieras guardar.
            </p>
            <button
              onClick={() => navigate("/catalogo")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-[#0B2C4D] transition"
            >
              Ver catálogo <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoritos.map((favorito) => {
              const producto = favorito.producto;
              if (!producto) return null;

              return (
                <article
                  key={favorito.id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden flex flex-col"
                >
                  <div className="relative bg-white overflow-hidden">
                    <img
                      src={obtenerImagen(producto)}
                      alt={producto.nombre}
                      className="w-full h-52 object-contain bg-white p-2"
                      width="400"
                      height="300"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (!e.currentTarget.src.endsWith('/placeholder.webp')) {
                          e.currentTarget.src = "/placeholder.webp";
                        }
                      }}
                    />
                    <button
                      onClick={() => eliminarFavorito(producto.id)}
                      disabled={eliminandoId === producto.id}
                      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white text-red-600 shadow-md flex items-center justify-center hover:bg-red-50 transition disabled:opacity-50"
                      title="Quitar de favoritos"
                    >
                      {eliminandoId === producto.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                    <span className="absolute top-3 left-3 bg-red-50 text-red-600 border border-red-100 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                      <Heart size={13} className="fill-red-600" /> Favorito
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <p className="text-xs text-gray-500 mb-2">
                      {producto.categoriaNombre || "Categoría"}
                      {producto.subcategoriaNombre ? ` • ${producto.subcategoriaNombre}` : ""}
                    </p>
                    <h3 className="text-lg font-extrabold text-gray-900 line-clamp-2 mb-2">
                      {producto.nombre}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">por {producto.nombreEmpresa || "Proveedor"}</p>

                    <div className="mt-auto">
                      <p className="text-xs text-blue-600 font-bold">Precio Online</p>
                      <p className="text-2xl font-extrabold text-blue-600 mb-4">
                        S/ {Number(producto.precioUnitario || 0).toFixed(2)}
                      </p>
                      <button
                        onClick={() => navigate(`/vista_producto?id=${producto.id}`)}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-[#0B2C4D] transition"
                      >
                        <ShoppingBag size={18} /> Ver producto
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 left-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-[#0B2C4D] transition-all duration-300 hover:scale-110 z-50"
          aria-label="Volver arriba"
        >
          <ChevronUp size={24} />
        </button>
      </main>
    </div>
  );
}
