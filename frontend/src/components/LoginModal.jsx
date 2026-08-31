import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, LogIn, X } from "lucide-react";
import authService from "../services/authService";
import { isValidEmail } from "../utils/formValidation";

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  const navigate = useNavigate();

  const [credenciales, setCredenciales] = useState({
    email: "",
    password: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredenciales({ ...credenciales, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!credenciales.email.trim()) {
      nuevosErrores.email = "El correo electrónico es obligatorio";
    } else if (!isValidEmail(credenciales.email)) {
      nuevosErrores.email = "Ingresa un correo válido";
    }
    if (!credenciales.password) nuevosErrores.password = "La contraseña es obligatoria";
    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const obtenerRutaPorRol = (rol) => {
    if (rol === "administrador") return "/Administrativa";
    if (rol === "proveedor") return "/proveedor/productos";
    return "/";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const response = await authService.login(credenciales);
      if (response.success) {
        const usuario = response.data?.usuario;
        const rutaDestino = obtenerRutaPorRol(usuario?.rol);

        toast.dismiss();
        toast.success("¡Bienvenido!");
        onClose();
        navigate(rutaDestino, { replace: true });
      }
    } catch (error) {
      toast.error(error.message || "Credenciales inválidas");
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
          aria-label="Cerrar formulario de inicio de sesión"
          title="Cerrar"
        >
          <X size={22} />
        </button>
        
        {/* Encabezado */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-50 p-3 rounded-full mb-3">
            <LogIn className="text-blue-600 w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Iniciar Sesión</h2>
          <p className="text-gray-500 text-sm mt-1">Accede a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={credenciales.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                disabled={loading}
                className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                  errors.email ? "border-red-500" : "border-gray-200"
                }`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs ml-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700 ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={credenciales.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                  errors.password ? "border-red-500" : "border-gray-200"
                }`}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs ml-1">{errors.password}</p>}
          </div>

          {/* Opciones extras: Recordarme / Olvidé contraseña */}
          <div className="flex justify-between items-center px-1">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded" />
              Recordarme
            </label>
            <button type="button" className="text-sm font-medium text-blue-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Botón de Acción */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-2 py-3.5 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-[#0B2C4D] active:scale-[0.98]"
            }`}
          >
            {loading ? "Iniciando..." : (
              <>
                <LogIn size={20} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-8">
          ¿No tienes una cuenta?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 font-bold hover:underline"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
}