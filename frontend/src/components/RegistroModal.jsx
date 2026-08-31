import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, X } from "lucide-react";
import usuarioService from "../services/usuarioService";
import { onlyDigits, isValidEmail, hasPasswordStrength } from "../utils/formValidation";

export default function RegistroModal({ isOpen, onClose, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const ANIM_DURATION = 150;
  const [visible, setVisible] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (isOpen) {
      setVisible(true);
      requestAnimationFrame(() => setShow(true));
    } else {
      setShow(false);
      timeoutId = setTimeout(() => setVisible(false), ANIM_DURATION);
    }
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  const inputClass = (field, extra = "") =>
    `w-full ${extra} py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition ${
      errors[field] ? "border-red-500 bg-red-50" : "border-gray-300"
    }`;

  const limpiarError = (name) => {
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = type === "checkbox" ? checked : value;

    if (name === "telefono") nextValue = onlyDigits(value, 9);

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    limpiarError(name);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
    if (!formData.apellido.trim()) nuevosErrores.apellido = "El apellido es obligatorio";

    if (!formData.email.trim()) {
      nuevosErrores.email = "El correo electrónico es obligatorio";
    } else if (!isValidEmail(formData.email)) {
      nuevosErrores.email = "Ingresa un correo válido, por ejemplo usuario@gmail.com";
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    } else if (formData.telefono.length !== 9) {
      nuevosErrores.telefono = "El teléfono debe tener exactamente 9 dígitos";
    }

    if (!formData.password) {
      nuevosErrores.password = "La contraseña es obligatoria";
    } else if (!hasPasswordStrength(formData.password)) {
      nuevosErrores.password = "Debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número";
    }

    if (!formData.confirmPassword) {
      nuevosErrores.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      nuevosErrores.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!formData.terms) nuevosErrores.terms = "Debes aceptar los términos y la política de privacidad";

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
      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };
      const response = await usuarioService.registrarUsuario(payload);
      if (response.success) {
        toast.success("¡Registro exitoso! Ahora inicia sesión.");
        setTimeout(() => onSwitchToLogin?.(), 800);
      }
    } catch (error) {
      toast.error(error.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-150 ${show ? "opacity-100" : "opacity-0"}`}>
      <div className={`relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8 transform transition-all duration-150 ${show ? "translate-y-0 scale-100" : "translate-y-2 scale-95"}`}>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Cerrar formulario de registro"
          title="Cerrar"
        >
          <X size={22} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-50 p-3 rounded-full mb-2">
            <UserPlus className="text-blue-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 text-center">Crear Cuenta</h2>
          <p className="text-gray-500 text-sm text-center">Regístrate para acceder a ofertas exclusivas</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex gap-3">
            <div className="w-1/2 flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Nombre *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Juan" maxLength={60} className={inputClass("nombre", "pl-9 pr-3")} />
              </div>
              {errors.nombre && <p className="text-red-600 text-xs">{errors.nombre}</p>}
            </div>
            <div className="w-1/2 flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Apellido *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Pérez" maxLength={60} className={inputClass("apellido", "pl-9 pr-3")} />
              </div>
              {errors.apellido && <p className="text-red-600 text-xs">{errors.apellido}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Correo Electrónico *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" maxLength={120} className={inputClass("email", "pl-10 pr-3")} />
            </div>
            {errors.email && <p className="text-red-600 text-xs">{errors.email}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Teléfono *</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="tel" inputMode="numeric" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="987654321" maxLength={9} className={inputClass("telefono", "pl-10 pr-3")} />
            </div>
            {errors.telefono ? <p className="text-red-600 text-xs">{errors.telefono}</p> : <p className="text-[11px] text-gray-500">Solo 9 dígitos. No se permiten letras.</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Contraseña *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={inputClass("password", "pl-10 pr-10")} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password ? <p className="text-red-600 text-xs">{errors.password}</p> : <div className="text-[11px] text-gray-500 mt-1 leading-tight">Requisitos: +8 caracteres, Mayús, Minús y un número.</div>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Confirmar Contraseña *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className={inputClass("confirmPassword", "pl-10 pr-3")} />
            </div>
            {errors.confirmPassword && <p className="text-red-600 text-xs">{errors.confirmPassword}</p>}
          </div>

          <div className="flex items-start gap-2 mt-1">
            <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} className="mt-1 w-4 h-4 accent-blue-600" />
            <p className="text-xs text-gray-600">
              Acepto los <span className="text-blue-600 font-semibold cursor-pointer">términos</span> y la <span className="text-blue-600 font-semibold cursor-pointer">política de privacidad</span>
            </p>
          </div>
          {errors.terms && <p className="text-red-600 text-xs -mt-2">{errors.terms}</p>}

          <button type="submit" disabled={loading} className={`mt-2 py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-[#0B2C4D] active:scale-[0.98] shadow-md shadow-blue-100"}`}>
            {loading ? "Procesando..." : <><UserPlus size={20} /> Crear Cuenta</>}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿Ya tienes una cuenta?{" "}
          <button type="button" onClick={onSwitchToLogin} className="text-blue-600 font-bold hover:underline">
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
