import React, { useState } from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import authService from "../services/authService";
import toast from "react-hot-toast";

export default function AddToCartButton({ producto, onLoginRequired }) {
  const { addToCart, loading } = useCart();
  const [cantidad, setCantidad] = useState(producto.cantidadMinima || 1);
  const [showQuantity, setShowQuantity] = useState(false);

  const handleAddToCart = async () => {
    if (!authService.isAuthenticated()) {
      toast.error("Debes iniciar sesión");
      if (onLoginRequired) onLoginRequired();
      return;
    }

    if (!producto.disponible) {
      toast.error("Producto no disponible");
      return;
    }

    if (!showQuantity) {
      setShowQuantity(true);
      return;
    }

    const success = await addToCart(producto.id, cantidad);
    if (success) {
      setShowQuantity(false);
      setCantidad(producto.cantidadMinima || 1);
    }
  };

  const handleIncrement = () => {
    if (cantidad < producto.stockDisponible) {
      setCantidad(cantidad + 1);
    } else {
      toast.error("Stock máximo alcanzado");
    }
  };

  const handleDecrement = () => {
    if (cantidad > (producto.cantidadMinima || 1)) {
      setCantidad(cantidad - 1);
    } else {
      toast.error(`Cantidad mínima: ${producto.cantidadMinima || 1}`);
    }
  };

  if (!showQuantity) {
    return (
      <button
        onClick={handleAddToCart}
        disabled={loading || !producto.disponible}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-[#0B2C4D] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <ShoppingCart size={18} />
        {producto.disponible ? "Agregar al carrito" : "No disponible"}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {/* Selector de cantidad */}
      <div className="flex items-center justify-center gap-3 bg-gray-100 rounded-lg p-2">
        <button
          onClick={handleDecrement}
          disabled={cantidad <= (producto.cantidadMinima || 1)}
          className="p-1 bg-white rounded hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus size={16} />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{cantidad}</span>
          <span className="text-xs text-gray-600">{producto.unidadMedida}</span>
        </div>

        <button
          onClick={handleIncrement}
          disabled={cantidad >= producto.stockDisponible}
          className="p-1 bg-white rounded hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Info de stock */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Mín: {producto.cantidadMinima}</span>
        <span>Stock: {producto.stockDisponible}</span>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowQuantity(false)}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
        >
          Cancelar
        </button>
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-[#0B2C4D] transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <ShoppingCart size={16} />
              Agregar
            </>
          )}
        </button>
      </div>
    </div>
  );
}