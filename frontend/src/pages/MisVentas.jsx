import React, { useState, useEffect } from "react";
import { TrendingUp, Calendar, Package, User, DollarSign, Search } from "lucide-react";
import ventaService from "../services/ventaService";
import toast from "react-hot-toast";

export default function MisVentas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    try {
      const data = await ventaService.obtenerMisVentas();
      setVentas(data);
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el historial de ventas");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar ventas por nombre de producto o número de pedido
  const ventasFiltradas = ventas.filter(v => 
    v.nombreProducto.toLowerCase().includes(filtro.toLowerCase()) ||
    v.numeroPedido.toLowerCase().includes(filtro.toLowerCase())
  );

  const totalIngresos = ventas.reduce((acc, curr) => acc + curr.subtotal, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Cabecera Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={32} />
              Mis Ventas
            </h1>
            <p className="text-gray-500 mt-1">Gestiona y visualiza tus pedidos recibidos</p>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">S/ {totalIngresos.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por producto o número de pedido..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla de Ventas */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Producto</th>
                  <th className="p-4 font-semibold">Fecha / Pedido</th>
                  <th className="p-4 font-semibold">Cliente</th>
                  <th className="p-4 font-semibold text-center">Cantidad</th>
                  <th className="p-4 font-semibold text-right">Total</th>
                  <th className="p-4 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ventasFiltradas.length > 0 ? (
                  ventasFiltradas.map((venta) => (
                    <tr key={venta.id} className="hover:bg-gray-50 transition">
                      {/* Producto */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={venta.imagenUrl || "/placeholder.webp"} 
                            alt={venta.nombreProducto} 
                            className="w-12 h-12 rounded-lg object-contain border border-gray-200 bg-white p-1"
                            width="48"
                            height="48"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              if (!e.currentTarget.src.endsWith('/placeholder.webp')) {
                                e.currentTarget.src = "/placeholder.webp";
                              }
                            }}
                          />
                          <span className="font-medium text-gray-900">{venta.nombreProducto}</span>
                        </div>
                      </td>

                      {/* Fecha y Pedido */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700 text-sm">#{venta.numeroPedido}</span>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <Calendar size={12} />
                            {new Date(venta.fechaVenta).toLocaleDateString()}
                          </div>
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="p-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <User size={14} className="text-gray-400"/>
                            {venta.clienteNombre}
                        </div>
                      </td>

                      {/* Cantidad */}
                      <td className="p-4 text-center">
                        <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                          {venta.cantidad}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="p-4 text-right">
                        <span className="font-bold text-blue-600">S/ {venta.subtotal.toFixed(2)}</span>
                        <p className="text-xs text-gray-400">c/u S/ {venta.precioUnitario.toFixed(2)}</p>
                      </td>

                      {/* Estado */}
                      <td className="p-4 text-center">
                         <span className={`px-2 py-1 rounded-md text-xs font-semibold 
                            ${venta.estadoPedido === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' : 
                              venta.estadoPedido === 'ENTREGADO' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                            {venta.estadoPedido}
                         </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      <Package size={48} className="mx-auto mb-3 text-gray-300" />
                      No se encontraron ventas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}