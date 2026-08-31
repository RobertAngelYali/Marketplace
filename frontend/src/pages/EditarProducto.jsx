import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, Image as ImageIcon, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import productoService from "../services/productoService";
import categoriaService from "../services/categoriaService";
import { onlyDigits, isValidUrl, fieldClass } from "../utils/formValidation";

export default function EditarProducto() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [producto, setProducto] = useState(null);

  const [formData, setFormData] = useState({
    categoriaId: "",
    subcategoriaId: "",
    nombre: "",
    descripcion: "",
    precioUnitario: "",
    unidadMedida: "kg",
    cantidadMinima: "",
    stockDisponible: "",
    disponible: true,
  });

  const [imagenes, setImagenes] = useState([]);
  const [nuevaImagen, setNuevaImagen] = useState("");
  const unidadesMedida = ["kg", "gramos", "unidad", "caja", "saco", "bolsa", "litro", "metro", "docena", "paquete"];

  useEffect(() => { cargarCategorias(); cargarProducto(); }, [id]);
  useEffect(() => { if (formData.categoriaId) cargarSubcategorias(formData.categoriaId); else setSubcategorias([]); }, [formData.categoriaId]);

  const cargarCategorias = async () => {
    try {
      const data = await categoriaService.obtenerCategorias();
      if (Array.isArray(data)) setCategorias(data);
    } catch (err) { console.error("Error al cargar categorías:", err); }
  };

  const cargarSubcategorias = async (categoriaId) => {
    try {
      const data = await categoriaService.obtenerSubcategoriasPorCategoria(categoriaId);
      setSubcategorias(Array.isArray(data) ? data : []);
    } catch (err) { console.error("Error al cargar subcategorías:", err); setSubcategorias([]); }
  };

  const cargarProducto = async () => {
    try {
      setLoading(true);
      const response = await productoService.obtenerProductoPorId(id);
      if (response.success) {
        const prod = response.data;
        setProducto(prod);
        setImagenes(prod.imagenes || []);
        setFormData({
          categoriaId: prod.categoriaId?.toString() || "",
          subcategoriaId: prod.subcategoriaId ? prod.subcategoriaId.toString() : "",
          nombre: prod.nombre || "",
          descripcion: prod.descripcion || "",
          precioUnitario: prod.precioUnitario?.toString() || "",
          unidadMedida: prod.unidadMedida || "kg",
          cantidadMinima: prod.cantidadMinima?.toString() || "",
          stockDisponible: prod.stockDisponible?.toString() || "",
          disponible: Boolean(prod.disponible),
        });
      }
    } catch (err) { setError(err.message || "Error al cargar producto"); }
    finally { setLoading(false); }
  };

  const clearError = (name) => {
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    if (error) setError("");
  };

  const sanitizeDecimal = (value) => {
    let clean = String(value || '').replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) clean = `${parts[0]}.${parts.slice(1).join('')}`;
    const [entero, decimal = ''] = clean.split('.');
    return clean.includes('.') ? `${entero.slice(0, 8)}.${decimal.slice(0, 2)}` : entero.slice(0, 8);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = type === "checkbox" ? checked : value;
    if (name === "precioUnitario") nextValue = sanitizeDecimal(value);
    if (name === "cantidadMinima") nextValue = onlyDigits(value, 6);
    if (name === "stockDisponible") nextValue = onlyDigits(value, 8);
    setFormData(prev => ({ ...prev, [name]: nextValue }));
    clearError(name);
  };

  const agregarImagen = async () => {
    const url = nuevaImagen.trim();
    if (!url) { setErrors(prev => ({ ...prev, nuevaImagen: "Ingresa una URL de imagen" })); return; }
    if (!isValidUrl(url)) { setErrors(prev => ({ ...prev, nuevaImagen: "Ingresa una URL válida que empiece con http:// o https://" })); return; }

    try {
      const response = await productoService.agregarImagen(id, url);
      if (response.success) {
        setImagenes(prev => [...prev, response.data]);
        setNuevaImagen("");
        setErrors(prev => ({ ...prev, nuevaImagen: "", imagenes: "" }));
        toast.success("Imagen agregada");
      }
    } catch (err) { toast.error(err.message || "Error al agregar imagen"); }
  };

  const eliminarImagen = async (imagenId) => {
    if (imagenes.length <= 1) {
      setErrors(prev => ({ ...prev, imagenes: "El producto debe tener al menos una imagen" }));
      toast.error("No puedes dejar el producto sin imagen");
      return;
    }
    if (!window.confirm("¿Estás seguro de eliminar esta imagen?")) return;
    try {
      const response = await productoService.eliminarImagen(id, imagenId);
      if (response.success) setImagenes(prev => prev.filter(img => img.id !== imagenId));
    } catch (err) { toast.error(err.message || "Error al eliminar imagen"); }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    const precio = Number(formData.precioUnitario);
    const cantidadMinima = Number(formData.cantidadMinima);
    const stockDisponible = Number(formData.stockDisponible);

    if (!formData.categoriaId) nuevosErrores.categoriaId = "Debes seleccionar una categoría";
    if (subcategorias.length > 0 && !formData.subcategoriaId) nuevosErrores.subcategoriaId = "Debes seleccionar una subcategoría";
    if (!formData.nombre.trim()) nuevosErrores.nombre = "El nombre del producto es obligatorio";
    if (!formData.descripcion.trim()) nuevosErrores.descripcion = "La descripción es obligatoria";
    if (!formData.precioUnitario) nuevosErrores.precioUnitario = "El precio es obligatorio";
    else if (Number.isNaN(precio) || precio <= 0) nuevosErrores.precioUnitario = "El precio debe ser mayor a 0";
    if (!formData.unidadMedida) nuevosErrores.unidadMedida = "Selecciona una unidad de medida";
    if (!formData.cantidadMinima) nuevosErrores.cantidadMinima = "La cantidad mínima es obligatoria";
    else if (!Number.isInteger(cantidadMinima) || cantidadMinima < 1) nuevosErrores.cantidadMinima = "La cantidad mínima debe ser al menos 1";
    if (formData.stockDisponible === "") nuevosErrores.stockDisponible = "El stock es obligatorio";
    else if (!Number.isInteger(stockDisponible) || stockDisponible < 0) nuevosErrores.stockDisponible = "El stock no puede ser negativo";
    if (imagenes.length === 0) nuevosErrores.imagenes = "Agrega al menos una imagen del producto";

    setErrors(nuevosErrores);
    if (Object.keys(nuevosErrores).length) setError("Completa o corrige los campos marcados");
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validarFormulario()) { toast.error("No se pudo guardar: revisa los campos obligatorios"); return; }

    try {
      setGuardando(true);
      const datosActualizados = {
        categoriaId: parseInt(formData.categoriaId),
        subcategoriaId: formData.subcategoriaId ? parseInt(formData.subcategoriaId) : null,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precioUnitario: parseFloat(formData.precioUnitario),
        unidadMedida: formData.unidadMedida,
        cantidadMinima: parseInt(formData.cantidadMinima),
        stockDisponible: parseInt(formData.stockDisponible),
        disponible: formData.disponible,
      };
      const response = await productoService.actualizarProducto(id, datosActualizados);
      if (response.success) {
        toast.success("Producto actualizado exitosamente");
        window.location.href = "/proveedor/productos";
      }
    } catch (err) { setError(err.message || "Error al actualizar producto"); toast.error(err.message || "Error al actualizar producto"); }
    finally { setGuardando(false); }
  };

  const ErrorText = ({ name }) => errors[name] ? <p className="mt-1 text-xs text-red-600">{errors[name]}</p> : null;

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Cargando producto...</p></div></div>;
  if (!producto) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><p className="text-red-600 text-lg">Producto no encontrado</p><button onClick={() => (window.location.href = "/proveedor/productos")} className="mt-4 text-blue-600 hover:text-blue-700">Volver a mis productos</button></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button onClick={() => (window.location.href = "/proveedor/productos")} className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"><ArrowLeft size={20} />Volver a mis productos</button>
          <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
          <p className="text-gray-600 mt-1">Actualiza todos los campos obligatorios de tu producto</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">{error}</div>}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                <select aria-label="Categoría del producto" name="categoriaId" value={formData.categoriaId} onChange={handleChange} className={fieldClass(errors.categoriaId)}>
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                </select>
                <ErrorText name="categoriaId" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategoría {subcategorias.length > 0 ? '*' : ''}</label>
                <select aria-label="Subcategoría del producto" name="subcategoriaId" value={formData.subcategoriaId} onChange={handleChange} disabled={!formData.categoriaId || subcategorias.length === 0} className={`${fieldClass(errors.subcategoriaId)} disabled:bg-gray-100`}>
                  <option value="">Selecciona una subcategoría</option>
                  {subcategorias.map(sub => <option key={sub.id} value={sub.id}>{sub.nombre}</option>)}
                </select>
                <ErrorText name="subcategoriaId" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto *</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} maxLength={255} className={fieldClass(errors.nombre)} />
              <ErrorText name="nombre" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={4} maxLength={800} className={fieldClass(errors.descripcion)} />
              <ErrorText name="descripcion" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio Unitario (S/) *</label>
                <input type="text" inputMode="decimal" name="precioUnitario" value={formData.precioUnitario} onChange={handleChange} className={fieldClass(errors.precioUnitario)} />
                <ErrorText name="precioUnitario" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unidad de Medida *</label>
                <select aria-label="Unidad de medida del producto" name="unidadMedida" value={formData.unidadMedida} onChange={handleChange} className={fieldClass(errors.unidadMedida)}>
                  {unidadesMedida.map(unidad => <option key={unidad} value={unidad}>{unidad}</option>)}
                </select>
                <ErrorText name="unidadMedida" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad Mínima *</label>
                <input type="text" inputMode="numeric" name="cantidadMinima" value={formData.cantidadMinima} onChange={handleChange} className={fieldClass(errors.cantidadMinima)} />
                <ErrorText name="cantidadMinima" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Disponible *</label>
                <input type="text" inputMode="numeric" name="stockDisponible" value={formData.stockDisponible} onChange={handleChange} className={fieldClass(errors.stockDisponible)} />
                <ErrorText name="stockDisponible" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" name="disponible" id="disponible" checked={formData.disponible} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor="disponible" className="text-sm font-medium text-gray-700">Producto disponible para la venta</label>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Imágenes *</h2>
            <div className="flex gap-2 mb-4">
              <input type="url" value={nuevaImagen} onChange={(e) => { setNuevaImagen(e.target.value); setErrors(prev => ({ ...prev, nuevaImagen: '' })); }} placeholder="https://ejemplo.com/imagen.jpg" className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nuevaImagen ? 'border-red-500 bg-red-50' : 'border-gray-300'}`} />
              <button type="button" onClick={agregarImagen} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-[#0B2C4D] flex items-center gap-2"><Plus size={20} />Agregar</button>
            </div>
            {errors.nuevaImagen && <p className="mb-2 text-xs text-red-600">{errors.nuevaImagen}</p>}
            {errors.imagenes && <p className="mb-2 text-xs text-red-600">{errors.imagenes}</p>}

            {imagenes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagenes.map(imagen => (
                  <div key={imagen.id} className="relative group">
                    <img
                      src={imagen.urlImagen}
                      alt="Producto"
                      className="w-full h-40 object-contain rounded-lg bg-white p-2 border border-slate-100"
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
                    <button type="button" onClick={() => eliminarImagen(imagen.id)} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            ) : <div className="text-center py-8 text-gray-500"><ImageIcon size={48} className="mx-auto mb-2 text-gray-400" /><p>No hay imágenes agregadas</p></div>}
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => (window.location.href = "/proveedor/productos")} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={guardando} className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-[#0B2C4D] disabled:bg-gray-400 flex items-center justify-center gap-2">
              {guardando ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Guardando...</> : <><Save size={20} />Guardar Cambios</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
