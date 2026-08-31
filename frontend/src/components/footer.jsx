// src/components/Footer.jsx
import React from "react";
import { Mail, MapPin, Package, Phone } from "./Icons";
import authService from "../services/authService";

export default function Footer() {
  const usuario = authService.getCurrentUser();
  const rol = usuario?.rol || "invitado";
  const esProveedor = rol === "proveedor";
  const esAdmin = rol === "administrador";

  const navegacion = esAdmin
    ? ["Panel administrativo", "Usuarios", "Productos", "Solicitudes mayoristas"]
    : esProveedor
      ? ["Mis productos", "Crear producto", "Reportes", "Mi perfil"]
      : ["Inicio", "Catálogo", "Categorías", "Soporte"];

  const servicios = esAdmin
    ? ["Gestión de usuarios", "Control de proveedores", "Alertas de stock", "Solicitudes al administrador"]
    : esProveedor
      ? ["Publicación de productos", "Gestión de stock", "Reportes de ventas", "Alertas de inventario"]
      : ["Compra mayorista", "Proveedores verificados", "Alertas de stock", "Solicitudes al administrador"];

  return (
    <footer className="bg-[#0B2C4D] text-white py-12 mt-16">
      <div className="tdp-container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Package className="text-blue-400" size={28} />
            <h2 className="text-xl font-extrabold">Tienda Don Pepito</h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Marketplace mayorista para comprar, vender y gestionar productos con alertas de stock y solicitudes especiales.
          </p>
        </div>

        <div>
          <h3 className="font-bold mb-4">Navegación</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            {navegacion.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Servicios</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            {servicios.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">Contáctanos</h3>
          <div className="space-y-3 text-slate-300 text-sm">
            <p className="flex items-center gap-2"><Mail size={16} /> soporte@tiendadonpepito.com</p>
            <p className="flex items-center gap-2"><Phone size={16} /> +51 999 999 999</p>
            <p className="flex items-center gap-2"><MapPin size={16} /> Lima, Perú</p>
          </div>
        </div>
      </div>

      <div className="tdp-container border-t border-white/10 mt-10 pt-6 text-center text-slate-400 text-sm">
        © 2025 Tienda Don Pepito — Todos los derechos reservados
      </div>
    </footer>
  );
}
