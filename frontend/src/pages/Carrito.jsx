import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  Package,
  ArrowRight,
} from "lucide-react";
import cartService from "../services/cartService";
import authService from "../services/authService";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

export default function Carrito() {
  const [carrito, setCarrito] = useState(null);
  const [loading, setLoading] = useState(true);
  const { refreshCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    cargarCarrito();
  }, []);

  const cargarCarrito = async () => {
    try {
      setLoading(true);

      if (!authService.isAuthenticated()) {
        // Opcional: Podrías usar navigate("/login") en lugar de window.location
        window.location.href = "/"; 
        return;
      }

      const response = await cartService.obtenerCarrito();
      setCarrito(response.data);
      await refreshCount();
    } catch (error) {
      console.error("Error al cargar carrito:", error);
      toast.error("Error al cargar el carrito");
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarCantidad = async (carritoId, nuevaCantidad) => {
    try {
      await cartService.actualizarCantidad(carritoId, nuevaCantidad);
      await cargarCarrito();
      await refreshCount();
      toast.success("Cantidad actualizada");
    } catch (error) {
      toast.error(error.message || "Error al actualizar cantidad");
    }
  };

  const handleEliminar = async (carritoId) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      await cartService.eliminarProducto(carritoId);
      await cargarCarrito();
      await refreshCount();
      toast.success("Producto eliminado");
    } catch (error) {
      toast.error(error.message || "Error al eliminar producto");
    }
  };

  const handleVaciarCarrito = async () => {
    if (!confirm("¿Estás seguro de vaciar todo el carrito?")) return;

    try {
      await cartService.vaciarCarrito();
      await cargarCarrito();
      await refreshCount();
      toast.success("Carrito vaciado");
    } catch (error) {
      toast.error(error.message || "Error al vaciar carrito");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  if (!carrito || carrito.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 mb-6">
            ¡Agrega productos para comenzar a comprar!
          </p>
          <a
            href="/catalogo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-[#0B2C4D] transition"
          >
            Ver productos
            <ArrowRight size={20} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Carrito</h1>
          <button
            onClick={handleVaciarCarrito}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 size={18} />
            Vaciar carrito
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items del carrito */}
          <div className="lg:col-span-2 space-y-4">
            {carrito.items.map((item) => (
              <CarritoItem
                key={item.id}
                item={item}
                onActualizar={handleActualizarCantidad}
                onEliminar={handleEliminar}
              />
            ))}
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Resumen del pedido
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Productos ({carrito.cantidadTotal})</span>
                  <span>{carrito.cantidadProductos} unidades</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Proveedores</span>
                  <span>{carrito.totalProveedores}</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Subtotal</span>
                    <span>S/ {carrito.subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Botón que ahora lleva al Checkout */}
              <button 
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-[#0B2C4D] transition font-semibold flex justify-center items-center gap-2"
              >
                  Proceder al pago
                  <ArrowRight size={20} />
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Los costos de envío se calcularán en el siguiente paso
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para cada item del carrito (Se mantiene igual, solo lógica visual)
function CarritoItem({ item, onActualizar, onEliminar }) {
  const [cantidad, setCantidad] = useState(item.cantidad);
  const [actualizando, setActualizando] = useState(false);

  const handleIncrement = async () => {
    if (cantidad >= item.stockDisponible) {
      toast.error("Stock máximo alcanzado");
      return;
    }

    const nuevaCantidad = cantidad + 1;
    setActualizando(true);
    setCantidad(nuevaCantidad);

    try {
      await onActualizar(item.id, nuevaCantidad);
    } catch (error) {
      setCantidad(cantidad);
    } finally {
      setActualizando(false);
    }
  };

  const handleDecrement = async () => {
    if (cantidad <= item.cantidadMinima) {
      toast.error(`Cantidad mínima: ${item.cantidadMinima}`);
      return;
    }

    const nuevaCantidad = cantidad - 1;
    setActualizando(true);
    setCantidad(nuevaCantidad);

    try {
      await onActualizar(item.id, nuevaCantidad);
    } catch (error) {
      setCantidad(cantidad);
    } finally {
      setActualizando(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex gap-4">
      {/* Imagen */}
      <div className="shrink-0">
        <img
          src={item.imagenUrl || "/placeholder.webp"}
          alt={item.nombreProducto}
          className="w-24 h-24 object-contain rounded-lg bg-white p-1 border border-slate-100"
          width="96"
          height="96"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            if (!e.currentTarget.src.endsWith('/placeholder.webp')) {
              e.currentTarget.src = "/placeholder.webp";
            }
          }}
        />
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">
              {item.nombreProducto}
            </h3>
            <p className="text-sm text-gray-500">{item.nombreEmpresa}</p>
          </div>
          <button
            onClick={() => onEliminar(item.id)}
            className="text-red-600 hover:text-red-700 transition"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          {/* Cantidad */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrement}
              disabled={actualizando || cantidad <= item.cantidadMinima}
              className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Minus size={16} />
            </button>

            <span className="w-12 text-center font-semibold">{cantidad}</span>

            <button
              onClick={handleIncrement}
              disabled={actualizando || cantidad >= item.stockDisponible}
              className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Plus size={16} />
            </button>

            <span className="text-xs text-gray-500 ml-2">
              {item.unidadMedida}
            </span>
          </div>

          {/* Precio */}
          <div className="text-right">
            <p className="text-sm text-gray-500">
              S/ {item.precioUnitario.toFixed(2)} c/u
            </p>
            <p className="text-lg font-bold text-blue-600">
              S/ {item.subtotal.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Stock disponible */}
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <Package size={12} />
          <span>Stock: {item.stockDisponible}</span>
          <span>•</span>
          <span>Mínimo: {item.cantidadMinima}</span>
        </div>

        {!item.disponible && (
          <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
            <AlertCircle size={12} />
            <span>Producto no disponible</span>
          </div>
        )}
      </div>
    </div>
  );
}
