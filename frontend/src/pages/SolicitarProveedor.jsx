import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Building2, FileText, Phone, Mail, Send, ArrowLeft } from "lucide-react";
import solicitudService from "../services/solicitudService";
import { onlyDigits, isValidEmail, fieldClass } from "../utils/formValidation";

export default function SolicitarProveedor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    ruc: "",
    nombreEmpresa: "",
    razonSocial: "",
    descripcion: "",
    direccion: "",
    telefonoEmpresa: "",
    emailEmpresa: "",
  });

  const clearError = (name) => {
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === "ruc") nextValue = onlyDigits(value, 11);
    if (name === "telefonoEmpresa") nextValue = onlyDigits(value, 9);

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    clearError(name);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombreEmpresa.trim()) nuevosErrores.nombreEmpresa = "El nombre de la empresa es obligatorio";
    if (!formData.ruc.trim()) nuevosErrores.ruc = "El RUC es obligatorio";
    else if (formData.ruc.length !== 11) nuevosErrores.ruc = "El RUC debe tener exactamente 11 dígitos";

    if (!formData.emailEmpresa.trim()) nuevosErrores.emailEmpresa = "El email de la empresa es obligatorio";
    else if (!isValidEmail(formData.emailEmpresa)) nuevosErrores.emailEmpresa = "Ingresa un email válido";

    if (!formData.telefonoEmpresa.trim()) nuevosErrores.telefonoEmpresa = "El teléfono es obligatorio";
    else if (formData.telefonoEmpresa.length !== 9) nuevosErrores.telefonoEmpresa = "El teléfono debe tener exactamente 9 dígitos";

    if (!formData.direccion.trim()) nuevosErrores.direccion = "La dirección es obligatoria";
    if (!formData.razonSocial.trim()) nuevosErrores.razonSocial = "La razón social es obligatoria";
    if (!formData.descripcion.trim()) nuevosErrores.descripcion = "La descripción es obligatoria";
    else if (formData.descripcion.trim().length < 50) nuevosErrores.descripcion = "La descripción debe tener mínimo 50 caracteres";

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) {
      toast.error("Completa o corrige los campos marcados");
      return;
    }

    setLoading(true);
    try {
      await solicitudService.crearSolicitud({
        ruc: formData.ruc,
        nombreEmpresa: formData.nombreEmpresa.trim(),
        razonSocial: formData.razonSocial.trim(),
        descripcion: formData.descripcion.trim(),
        direccion: formData.direccion.trim(),
        telefonoEmpresa: formData.telefonoEmpresa,
        emailEmpresa: formData.emailEmpresa.trim(),
      });
      toast.success("¡Solicitud enviada exitosamente! Espera la aprobación del administrador.");
      navigate("/Miperfil");
    } catch (error) {
      toast.error(error.message || "Error al enviar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  const ErrorText = ({ name }) => errors[name] ? <p className="mt-1 text-xs text-red-600">{errors[name]}</p> : null;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Solicitar ser Proveedor</h1>
          <p className="text-gray-600">Completa todos los campos. Un administrador revisará tu solicitud.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><Building2 className="inline w-4 h-4 mr-2" />Nombre de la Empresa *</label>
            <input type="text" name="nombreEmpresa" value={formData.nombreEmpresa} onChange={handleChange} maxLength={120} className={fieldClass(errors.nombreEmpresa)} placeholder="Ej: Distribuidora ABC SAC" />
            <ErrorText name="nombreEmpresa" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><FileText className="inline w-4 h-4 mr-2" />RUC *</label>
            <input type="text" inputMode="numeric" name="ruc" value={formData.ruc} onChange={handleChange} maxLength={11} className={fieldClass(errors.ruc)} placeholder="20123456789" />
            {errors.ruc ? <ErrorText name="ruc" /> : <p className="mt-1 text-xs text-gray-500">Debe contener 11 dígitos. No se permiten letras.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><Mail className="inline w-4 h-4 mr-2" />Email de la Empresa *</label>
            <input type="email" name="emailEmpresa" value={formData.emailEmpresa} onChange={handleChange} maxLength={120} className={fieldClass(errors.emailEmpresa)} placeholder="contacto@empresa.com" />
            <ErrorText name="emailEmpresa" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2"><Phone className="inline w-4 h-4 mr-2" />Teléfono *</label>
            <input type="tel" inputMode="numeric" name="telefonoEmpresa" value={formData.telefonoEmpresa} onChange={handleChange} maxLength={9} className={fieldClass(errors.telefonoEmpresa)} placeholder="987654321" />
            {errors.telefonoEmpresa ? <ErrorText name="telefonoEmpresa" /> : <p className="mt-1 text-xs text-gray-500">9 dígitos sin espacios. No se permiten letras.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} maxLength={180} className={fieldClass(errors.direccion)} placeholder="Av. Principal 123, Lima" />
            <ErrorText name="direccion" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Razón Social *</label>
            <input type="text" name="razonSocial" value={formData.razonSocial} onChange={handleChange} maxLength={180} className={fieldClass(errors.razonSocial)} placeholder="Ingrese la razón social de su empresa" />
            <ErrorText name="razonSocial" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción de tu Empresa *</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="4" maxLength={600} className={`${fieldClass(errors.descripcion)} resize-none`} placeholder="Describe brevemente tu empresa, productos que ofreces, experiencia en el rubro, etc." />
            {errors.descripcion ? <ErrorText name="descripcion" /> : <p className="mt-1 text-xs text-gray-500">Mínimo 50 caracteres - {formData.descripcion.trim().length}/50</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-[#0B2C4D] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Enviando...</> : <><Send className="w-4 h-4" />Enviar Solicitud</>}
            </button>
          </div>
        </form>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800"><strong>Nota:</strong> Una vez enviada tu solicitud, un administrador la revisará. El proceso puede tomar entre 24-48 horas hábiles.</p>
        </div>
      </div>
    </div>
  );
}
