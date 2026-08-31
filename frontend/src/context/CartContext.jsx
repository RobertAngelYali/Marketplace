import { createContext, useContext, useState, useEffect } from 'react';
import cartService from '../services/cartService';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cargar contador al montar y cuando cambia la sesión.
  useEffect(() => {
    loadCartCount();

    const handleAuthChange = () => {
      loadCartCount();
    };

    window.addEventListener(authService.AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener(authService.AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  /**
   * Cargar contador de items del carrito
   */
  const loadCartCount = async () => {
    try {
      const usuario = authService.getCurrentUser();

      // El carrito solo corresponde al comprador normal.
      // Invitado, proveedor y administrador no deben consultar endpoints de carrito.
      if (!authService.isAuthenticated() || usuario?.rol !== 'usuario') {
        setCartCount(0);
        return;
      }

      const count = await cartService.contarItems();
      setCartCount(count);
    } catch (error) {
      console.error('Error al cargar contador:', error);
      setCartCount(0);
    }
  };

  /**
   * Agregar producto al carrito
   */
  const addToCart = async (productoId, cantidad) => {
    try {
      setLoading(true);

      const usuario = authService.getCurrentUser();

      if (!authService.isAuthenticated()) {
        toast.error('Debes iniciar sesión para agregar productos');
        return false;
      }

      if (usuario?.rol !== 'usuario') {
        toast.error('El carrito solo está disponible para usuarios compradores');
        return false;
      }

      await cartService.agregarProducto({ productoId, cantidad });
      await loadCartCount();
      
      toast.success('Producto agregado al carrito');
      return true;
    } catch (error) {
      toast.error(error.message || 'Error al agregar producto');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar cantidad de un item
   */
  const updateQuantity = async (carritoId, cantidad) => {
    try {
      setLoading(true);
      await cartService.actualizarCantidad(carritoId, cantidad);
      toast.success('Cantidad actualizada');
      return true;
    } catch (error) {
      toast.error(error.message || 'Error al actualizar cantidad');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar producto del carrito
   */
  const removeFromCart = async (carritoId) => {
    try {
      setLoading(true);
      await cartService.eliminarProducto(carritoId);
      await loadCartCount();
      toast.success('Producto eliminado del carrito');
      return true;
    } catch (error) {
      toast.error(error.message || 'Error al eliminar producto');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Vaciar carrito completo
   */
  const clearCart = async () => {
    try {
      setLoading(true);
      await cartService.vaciarCarrito();
      setCartCount(0);
      toast.success('Carrito vaciado');
      return true;
    } catch (error) {
      toast.error(error.message || 'Error al vaciar carrito');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refrescar contador
   */
  const refreshCount = async () => {
    await loadCartCount();
  };

  const value = {
    cartCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
