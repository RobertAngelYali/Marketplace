import { API_ENDPOINTS } from "../config/api";

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

async function fetchJsonCached(key, url) {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached?.data && now - cached.time < CACHE_TTL_MS) {
    return cached.data;
  }

  if (cached?.promise) {
    return cached.promise;
  }

  const promise = fetch(url, { method: "GET" })
    .then(async (response) => {
      if (!response.ok) throw new Error("Error al obtener datos");
      const data = await response.json();
      const result = data.data || [];
      cache.set(key, { data: result, time: Date.now() });
      return result;
    })
    .catch((error) => {
      cache.delete(key);
      throw error;
    });

  cache.set(key, { promise, time: now });
  return promise;
}

const categoriaService = {
  async obtenerCategorias() {
    try {
      return await fetchJsonCached("categorias", API_ENDPOINTS.PUBLIC_CATEGORIAS);
    } catch (error) {
      console.error("Error en obtenerCategorias:", error);
      throw error;
    }
  },

  async obtenerSubcategorias() {
    try {
      return await fetchJsonCached("subcategorias", API_ENDPOINTS.PUBLIC_SUBCATEGORIAS);
    } catch (error) {
      console.error("Error en obtenerSubcategorias:", error);
      throw error;
    }
  },

  async obtenerSubcategoriasPorCategoria(categoriaId) {
    try {
      return await fetchJsonCached(
        `subcategorias-${categoriaId}`,
        API_ENDPOINTS.PUBLIC_SUBCATEGORIAS_POR_CATEGORIA(categoriaId)
      );
    } catch (error) {
      console.error("Error en obtenerSubcategoriasPorCategoria:", error);
      throw error;
    }
  },

  limpiarCache() {
    cache.clear();
  },
};

export default categoriaService;
