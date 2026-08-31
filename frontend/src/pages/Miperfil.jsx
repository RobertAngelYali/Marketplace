import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Save, Edit2, Shield, Calendar } from "lucide-react";
import usuarioService from "../services/usuarioService";
import toast from "react-hot-toast";
import { onlyDigits } from "../utils/formValidation";

export default function Miperfil() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    telefono: ""
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const data = await usuarioService.obtenerPerfil();
      setUsuario(data);
      setFormData({
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono || ""
      });
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "telefono" ? onlyDigits(value, 9) : value;
    setFormData({ ...formData, [name]: nextValue });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!formData.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
    if (!formData.apellido.trim()) nuevosErrores.apellido = "El apellido es obligatorio";
    if (!formData.telefono.trim()) nuevosErrores.telefono = "El teléfono es obligatorio";
    else if (formData.telefono.length !== 9) nuevosErrores.telefono = "El teléfono debe tener exactamente 9 dígitos";
    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) {
      toast.error("Completa o corrige los campos marcados");
      return;
    }
    try {
      await usuarioService.actualizarPerfil({ ...formData, nombre: formData.nombre.trim(), apellido: formData.apellido.trim() });
      setUsuario({ ...usuario, ...formData });
      setEditando(false);
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      toast.error(error.message || "No se pudo actualizar");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <User className="text-blue-600" size={32} />
          Mi Perfil
        </h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Cabecera con fondo */}
          <div className="h-40 bg-gradient-to-r from-blue-600 to-blue-700"></div>
          
          <div className="px-8 pb-8">
            {/* Contenedor Flex Principal */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              
              {/* 1. Avatar (con margen negativo para subir SOLO la foto) */}
              <div className="-mt-16 shrink-0 flex justify-center md:justify-start">
                <div className="w-32 h-32 bg-white rounded-full p-1 shadow-md border-4 border-white">
                  <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-4xl font-bold uppercase select-none">
                    {usuario.nombre ? usuario.nombre.charAt(0) : "U"}
                    {usuario.apellido ? usuario.apellido.charAt(0) : ""}
                  </div>
                </div>
              </div>

              {/* 2. Nombre y Botón (Sin margen negativo, se quedan en lo blanco) */}
              <div className="flex-1 flex flex-col md:flex-row justify-between items-center md:items-end pt-2 text-center md:text-left gap-4">
                <div>
                  <h2 className="text-4xl font-bold text-gray-800 tracking-tight">
                    {usuario.nombre} {usuario.apellido}
                  </h2>
                  <div className="mt-2 flex justify-center md:justify-start">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wide">
                      <Shield size={12} />
                      {usuario.rol}
                    </span>
                  </div>
                </div>
                
                {!editando && (
                  <button
                    onClick={() => setEditando(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition shadow-sm font-medium"
                  >
                    <Edit2 size={18} />
                    Editar Perfil
                  </button>
                )}
              </div>
            </div>

            {/* Formulario / Vista */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                  {editando ? (
                    <>
                      <input
                        type="text"
                        name="nombre"
                        required
                        value={formData.nombre}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.nombre ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                      />
                      {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
                    </>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-800 font-medium">
                      {usuario.nombre}
                    </div>
                  )}
                </div>

                {/* Apellido */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido</label>
                  {editando ? (
                    <>
                      <input
                        type="text"
                        name="apellido"
                        required
                        value={formData.apellido}
                        onChange={handleChange}
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.apellido ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                      />
                      {errors.apellido && <p className="text-xs text-red-600 mt-1">{errors.apellido}</p>}
                    </>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-800 font-medium">
                      {usuario.apellido}
                    </div>
                  )}
                </div>

                {/* Email (Solo lectura) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg border border-gray-200 text-gray-500 cursor-not-allowed">
                    <Mail size={18} />
                    {usuario.email}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 ml-1">El email no se puede cambiar</p>
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                  {editando ? (
                    <>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="999999999"
                        maxLength={9}
                        inputMode="numeric"
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.telefono ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                      />
                      {errors.telefono ? <p className="text-xs text-red-600 mt-1">{errors.telefono}</p> : <p className="text-xs text-gray-500 mt-1">Solo 9 dígitos. No se permiten letras.</p>}
                    </>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-800 font-medium">
                      <Phone size={18} className="text-gray-400" />
                      {usuario.telefono || <span className="text-gray-400 italic font-normal">No especificado</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              {editando && (
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEditando(false);
                      setFormData({
                        nombre: usuario.nombre,
                        apellido: usuario.apellido,
                        telefono: usuario.telefono || ""
                      });
                      setErrors({});
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-[#0B2C4D] transition shadow-sm"
                  >
                    <Save size={18} />
                    Guardar Cambios
                  </button>
                </div>
              )}
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
              <Calendar size={14} className="text-blue-500"/>
              Miembro desde: {usuario.fechaRegistro ? new Date(usuario.fechaRegistro).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}