import React, { useState } from "react";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import { isValidEmail } from "../utils/formValidation";

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nuevosErrores = {};
    if (!formData.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
    if (!formData.email.trim()) nuevosErrores.email = "El correo es obligatorio";
    else if (!isValidEmail(formData.email)) nuevosErrores.email = "Ingresa un correo válido";
    if (!formData.asunto) nuevosErrores.asunto = "Selecciona un asunto";
    if (!formData.mensaje.trim()) nuevosErrores.mensaje = "El mensaje es obligatorio";
    else if (formData.mensaje.trim().length < 10) nuevosErrores.mensaje = "El mensaje debe tener al menos 10 caracteres";

    setErrors(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      toast.error("Completa o corrige los campos marcados");
      return;
    }

    const telefono = "51960142988";

    const textoMensaje = `
Hola *Faraón*, tengo una nueva consulta desde la web:

👤 *Nombre:* ${formData.nombre}
📧 *Email:* ${formData.email}
blob *Asunto:* ${formData.asunto}
📝 *Mensaje:* ${formData.mensaje}

Espero su respuesta.
    `.trim();

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(
      textoMensaje
    )}`;

    window.open(url, "_blank");

    setFormData({ nombre: "", email: "", asunto: "", mensaje: "" });
    setErrors({});
  };

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Hero / Info */}
        <section className="space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-900">Contáctanos</h1>
          <p className="text-gray-600 text-lg">
            ¿Tienes dudas, comentarios o necesitas ayuda con un pedido? Nuestro
            equipo está listo para asistirte. Completa el formulario y te
            responderemos vía WhatsApp automáticamente.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800">Soporte</h3>
              <p className="text-sm text-gray-600 mt-1">soporte@faraon.com</p>
              <p className="text-sm text-gray-500 mt-2">
                Horario: Lun-Vie 9:00 - 18:00
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800">Ventas</h3>
              <p className="text-sm text-gray-600 mt-1">ventas@faraon.com</p>
              <p className="text-sm text-gray-500 mt-2">Tel: +51 960 142 988</p>
            </div>
          </div>

          <div className="mt-4 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
            <div className="p-6">
              <h4 className="font-semibold text-gray-800 mb-2">Ubicación</h4>
              <p className="text-sm text-gray-600">
                Visítanos en nuestra tienda principal.
              </p>
            </div>
            <div className="w-full h-48 bg-gray-100 overflow-hidden">
              <iframe
                title="Ubicación Faraón"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.666994165686!2d-77.03907722425555!3d-12.066442642270928!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8ea50161bb5%3A0x6734e5695029e00b!2sUniversidad%20Tecnol%C3%B3gica%20del%20Per%C3%BA!5e0!3m2!1ses!2spe!4v1716335123456!5m2!1ses!2spe"
                className="w-full h-full border-0"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        {/* Form */}
        <section>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Envíanos tu consulta
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Serás redirigido a WhatsApp para enviar tu mensaje.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Nombre"
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nombre ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                />
                {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Correo electrónico"
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-1 block">
                  Asunto
                </label>
                <select
                  aria-label="Seleccionar asunto del mensaje"
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.asunto ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                >
                  <option value="">Escoge el problema...</option>
                  <option value="Consulta General">Consulta general</option>
                  <option value="Problema Pedido">Problema con pedido</option>
                  <option value="Soporte Tecnico">Soporte técnico</option>
                  <option value="Sugerencia">Sugerencia</option>
                  <option value="Otro">Otro</option>
                </select>
                {errors.asunto && <p className="text-xs text-red-600 mt-1">{errors.asunto}</p>}
              </div>

              <div>
                <label className="text-sm text-gray-700 mb-1 block">
                  Mensaje
                </label>
                <textarea
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Cuéntanos con detalle tu consulta..."
                  className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.mensaje ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                />
                {errors.mensaje && <p className="text-xs text-red-600 mt-1">{errors.mensaje}</p>}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-5 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Send size={18} />
                  Enviar a WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      nombre: "",
                      email: "",
                      asunto: "",
                      mensaje: "",
                    })
                  }
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-[#0B2C4D] transition"
                >
                  Limpiar
                </button>
              </div>
            </form>

            <p className="mt-6 text-xs text-gray-500">
              Al hacer clic en enviar, se abrirá WhatsApp Web o la App con tu
              mensaje pre-redactado.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
