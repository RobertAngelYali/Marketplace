import { Suspense, lazy, useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import ProtectedRoute from "./components/ProtectedRoute";
import { CartProvider } from "./context/CartContext";

const Home = lazy(() => import("./pages/Home"));
const Catalogo = lazy(() => import("./pages/Catalogo"));
const Miperfil = lazy(() => import("./pages/Miperfil"));
const Administrativa = lazy(() => import("./pages/Administrativa"));
const Carrito = lazy(() => import("./pages/Carrito"));
const Contacto = lazy(() => import("./pages/Contacto"));
const Mispedidos = lazy(() => import("./pages/Mispedidos"));
const MisFavoritos = lazy(() => import("./pages/MisFavoritos"));
const VistaProducto = lazy(() => import("./pages/vista_producto"));
const DetallePedido = lazy(() => import("./pages/DetallePedido"));
const SolicitarProveedor = lazy(() => import("./pages/SolicitarProveedor"));
const ReportesP = lazy(() => import("./pages/reportesP"));
const MisProductos = lazy(() => import("./pages/Misproductos"));
const CrearProducto = lazy(() => import("./pages/CrearProducto"));
const EditarProducto = lazy(() => import("./pages/EditarProducto"));
const Checkout = lazy(() => import("./pages/Checkout"));
const LoginModal = lazy(() => import("./components/LoginModal"));
const RegistroModal = lazy(() => import("./components/RegistroModal"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]" aria-live="polite">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      <p className="mt-4 text-gray-600">Cargando...</p>
    </div>
  </div>
);

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegistro, setShowRegistro] = useState(false);

  const abrirLogin = () => {
    setShowRegistro(false);
    setShowLogin(true);
  };

  const abrirRegistro = () => {
    setShowLogin(false);
    setShowRegistro(true);
  };

  const cerrarModales = () => {
    setShowLogin(false);
    setShowRegistro(false);
  };

  useEffect(() => {
    window.addEventListener("open-login-modal", abrirLogin);
    window.addEventListener("open-register-modal", abrirRegistro);

    return () => {
      window.removeEventListener("open-login-modal", abrirLogin);
      window.removeEventListener("open-register-modal", abrirRegistro);
    };
  }, []);

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#363636",
              padding: "16px",
              borderRadius: "8px",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />

        <Navbar onLoginClick={abrirLogin} onRegisterClick={abrirRegistro} />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute pagina="home">
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Catalogo"
              element={
                <ProtectedRoute pagina="Catalogo">
                  <Catalogo />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Contacto"
              element={
                <ProtectedRoute pagina="contacto">
                  <Contacto />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Carrito"
              element={
                <ProtectedRoute pagina="carrito">
                  <Carrito />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Checkout"
              element={
                <ProtectedRoute pagina="Checkout">
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vista_producto"
              element={
                <ProtectedRoute pagina="VistaProducto">
                  <VistaProducto />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Miperfil"
              element={
                <ProtectedRoute pagina="miperfil">
                  <Miperfil />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Mispedidos"
              element={
                <ProtectedRoute pagina="mispedidos">
                  <Mispedidos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favoritos"
              element={
                <ProtectedRoute pagina="favoritos">
                  <MisFavoritos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mispedidos/:pedidoId"
              element={
                <ProtectedRoute pagina="detallepedido">
                  <DetallePedido />
                </ProtectedRoute>
              }
            />
            <Route
              path="/solicitar-proveedor"
              element={
                <ProtectedRoute pagina="solicitarproveedor">
                  <SolicitarProveedor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ReportesP"
              element={
                <ProtectedRoute pagina="ReportesP">
                  <ReportesP />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proveedor/productos"
              element={
                <ProtectedRoute pagina="misproductos">
                  <MisProductos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proveedor/productos/nuevo"
              element={
                <ProtectedRoute pagina="crearproducto">
                  <CrearProducto />
                </ProtectedRoute>
              }
            />
            <Route
              path="/proveedor/productos/editar/:id"
              element={
                <ProtectedRoute pagina="editarproducto">
                  <EditarProducto />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Administrativa"
              element={
                <ProtectedRoute pagina="administrativa">
                  <Administrativa />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>

        <Footer />

        <Suspense fallback={null}>
          {showLogin && (
            <LoginModal
              isOpen={showLogin}
              onClose={cerrarModales}
              onSwitchToRegister={abrirRegistro}
            />
          )}
          {showRegistro && (
            <RegistroModal
              isOpen={showRegistro}
              onClose={cerrarModales}
              onSwitchToLogin={abrirLogin}
            />
          )}
        </Suspense>
      </div>
    </CartProvider>
  );
}

export default App;
