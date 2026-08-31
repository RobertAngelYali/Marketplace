import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Componente para proteger rutas según permisos de rol.
 * Redirige sin mostrar alertas para evitar errores visuales al iniciar/cerrar sesión.
 */
export default function ProtectedRoute({ children, pagina, requiereAuth = true }) {
  const { canAccess, loading, getHomeByRole } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si la ruta no requiere autenticación, permitir acceso directo
  if (!requiereAuth) {
    return children;
  }

  // Si el usuario no tiene permiso, se redirige a la pantalla correcta por rol.
  // No se muestra toast.error para evitar duplicados en StrictMode y al cerrar sesión.
  if (!canAccess(pagina)) {
    return <Navigate to={getHomeByRole()} replace />;
  }

  return children;
}
