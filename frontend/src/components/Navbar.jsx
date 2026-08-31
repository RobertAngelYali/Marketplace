import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  User,
  LogOut,
  UserCircle,
  Package,
  Home,
  Phone,
  Tag,
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Store,
  Heart,
} from "./Icons";
import { useNavigate } from "react-router-dom";

import authService from "../services/authService";
import categoriaService from "../services/categoriaService";
import productoService from "../services/productoService";
import toast from "react-hot-toast";
import SearchBar from "./SearchBar";
import { useCart } from "../context/CartContext";

export default function Navbar({ onLoginClick, onRegisterClick }) {
  const [usuario, setUsuario] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [expandedCategoryMobile, setExpandedCategoryMobile] = useState(null);

  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(false);

  const menuRef = useRef(null);
  const catRef = useRef(null);
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const rol = usuario?.rol || "invitado";
  const esComprador = rol === "invitado" || rol === "usuario";
  const esProveedor = rol === "proveedor";
  const esAdmin = rol === "administrador";

  const rutaPrincipalPorRol = () => {
    if (esAdmin) return "/Administrativa";
    if (esProveedor) return "/proveedor/productos";
    return "/";
  };

  useEffect(() => {
    const syncUsuario = () => {
      setUsuario(authService.getCurrentUser());
    };

    syncUsuario();
    window.addEventListener(authService.AUTH_CHANGE_EVENT, syncUsuario);
    window.addEventListener("storage", syncUsuario);

    return () => {
      window.removeEventListener(authService.AUTH_CHANGE_EVENT, syncUsuario);
      window.removeEventListener("storage", syncUsuario);
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
      if (catRef.current && !catRef.current.contains(e.target)) {
        setShowCategories(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if ((showCategories || mobileOpen) && categorias.length === 0 && !cargandoCategorias) {
      cargarCategorias();
    }
  }, [showCategories, mobileOpen, categorias.length, cargandoCategorias]);

  const cargarCategorias = async () => {
    if (cargandoCategorias || categorias.length > 0) return;

    try {
      setCargandoCategorias(true);
      const [categoriasData, subcategoriasData] = await Promise.all([
        categoriaService.obtenerCategorias(),
        categoriaService.obtenerSubcategorias(),
      ]);
      setCategorias(categoriasData);
      setSubcategorias(subcategoriasData);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      // No bloqueamos el navbar si hay error con categorías.
    } finally {
      setCargandoCategorias(false);
    }
  };

  const obtenerSubcategoriasPorCategoria = (categoriaId) => {
    return subcategorias.filter((sub) => sub.categoriaId === categoriaId);
  };

  const handleCerrarSesion = () => {
    toast.dismiss();
    authService.logout();
    setUsuario(null);
    setMenuAbierto(false);
    setMobileOpen(false);
    setShowCategories(false);
    navigate("/", { replace: true });
    toast.success("Sesión cerrada");
  };

  const handleNavigate = (path) => {
    setMenuAbierto(false);
    setMobileOpen(false);
    setShowCategories(false);
    navigate(path);
  };

  const handleCategoriaClick = (categoriaNombre) => {
    if (!esComprador) return;
    handleNavigate(`/catalogo?categoria=${encodeURIComponent(categoriaNombre)}`);
  };

  const handleSubcategoriaClick = (categoriaNombre, subcategoriaNombre) => {
    if (!esComprador) return;
    handleNavigate(
      `/catalogo?categoria=${encodeURIComponent(categoriaNombre)}&subcategoria=${encodeURIComponent(subcategoriaNombre)}`
    );
  };

  const toggleMobileCategory = (catId) => {
    setExpandedCategoryMobile((actual) => (actual === catId ? null : catId));
  };

  const renderUserDropdown = () => (
    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <p className="text-sm font-bold text-gray-800">
          {usuario.nombre} {usuario.apellido}
        </p>
        <p className="text-xs text-gray-500 mb-1">{usuario.email}</p>
        <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border border-blue-200">
          {usuario.rol}
        </span>
      </div>

      <div className="py-1">
        <button
          onClick={() => handleNavigate("/miperfil")}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
        >
          <UserCircle size={16} /> <span>Mi Perfil</span>
        </button>

        {rol === "usuario" && (
          <>
            <button
              onClick={() => handleNavigate("/mispedidos")}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
            >
              <Package size={16} /> <span>Mis Pedidos</span>
            </button>
            <button
              onClick={() => handleNavigate("/favoritos")}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
            >
              <Heart size={16} className="text-red-500" /> <span>Mis Favoritos</span>
            </button>
          </>
        )}
      </div>

      {esProveedor && (
        <div className="py-1 border-t border-gray-100">
          <p className="px-4 py-1 text-xs font-bold text-gray-400 uppercase">Panel Proveedor</p>
          <button onClick={() => handleNavigate("/proveedor/productos")} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
            <Store size={16} className="text-blue-600" /> <span>Mis Productos</span>
          </button>
          <button onClick={() => handleNavigate("/proveedor/productos/nuevo")} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
            <PlusCircle size={16} className="text-green-600" /> <span>Crear Producto</span>
          </button>
          <button onClick={() => handleNavigate("/ReportesP")} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
            <ClipboardList size={16} className="text-purple-600" /> <span>Reportes</span>
          </button>
        </div>
      )}

      {esAdmin && (
        <div className="py-1 border-t border-gray-100">
          <p className="px-4 py-1 text-xs font-bold text-gray-400 uppercase">Administración</p>
          <button onClick={() => handleNavigate("/Administrativa")} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50">
            <LayoutDashboard size={16} className="text-blue-600" /> <span>Panel Administrativo</span>
          </button>
        </div>
      )}

      <div className="border-t border-gray-100 mt-1 pt-1">
        <button
          onClick={handleCerrarSesion}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
        >
          <LogOut size={16} /> <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <header className="w-full bg-white shadow-sm border-b border-gray-200 relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 -ml-2 text-gray-700 hover:text-blue-700 transition"
                aria-label="Abrir menú"
              >
                <Menu size={24} />
              </button>
            </div>

            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={() => handleNavigate(rutaPrincipalPorRol())}
                className="text-2xl font-extrabold text-blue-700 hover:opacity-90"
              >
                Tienda Don Pepito
              </button>
            </div>

            {esComprador ? (
              <div className="flex-1 mx-2 sm:mx-6">
                <SearchBar productoService={productoService} onNavigate={handleNavigate} />
              </div>
            ) : (
              <div className="hidden lg:flex flex-1 justify-center">
                {esProveedor && (
                  <nav className="flex items-center gap-2 text-gray-700 font-medium">
                    <button onClick={() => handleNavigate("/proveedor/productos")} className="px-3 py-2 hover:text-blue-600">Mis productos</button>
                    <button onClick={() => handleNavigate("/proveedor/productos/nuevo")} className="px-3 py-2 hover:text-blue-600">Crear producto</button>
                    <button onClick={() => handleNavigate("/ReportesP")} className="px-3 py-2 hover:text-blue-600">Reportes</button>
                  </nav>
                )}
                {esAdmin && (
                  <nav className="flex items-center gap-2 text-gray-700 font-medium">
                    <button onClick={() => handleNavigate("/Administrativa")} className="px-3 py-2 hover:text-blue-600">Panel administrativo</button>
                  </nav>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              {esComprador && (
                <button
                  onClick={() => handleNavigate("/carrito")}
                  className="relative p-2 text-gray-700 hover:text-blue-700 transition"
                  aria-label="Carrito de compras"
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </button>
              )}

              {usuario ? (
                <div className="relative hidden md:block" ref={menuRef}>
                  <button
                    onClick={() => setMenuAbierto((s) => !s)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    <User size={18} />
                    <span className="text-sm font-medium">{usuario.nombre}</span>
                    <ChevronDown size={16} className={`${menuAbierto ? "rotate-180" : ""} transition-transform`} />
                  </button>

                  {menuAbierto && renderUserDropdown()}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <button onClick={onLoginClick} className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                    Iniciar sesión
                  </button>
                  <button onClick={onRegisterClick} className="px-3 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition">
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {esComprador && (
          <div className="border-t border-gray-100 hidden md:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-4">
                  <div className="relative" ref={catRef}>
                    <button
                      onClick={() => setShowCategories((s) => !s)}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition"
                    >
                      Categorías
                      <ChevronRight size={16} className={`${showCategories ? "rotate-90" : ""} transition-transform`} />
                    </button>

                    {showCategories && (
                      <div className="absolute left-0 mt-2 w-[600px] bg-white rounded-lg shadow-xl border border-gray-200 py-4 z-50 max-h-[500px] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-6 px-4">
                          {categorias.map((categoria) => (
                            <div key={categoria.id} className="flex flex-col gap-2">
                              <button onClick={() => handleCategoriaClick(categoria.nombre)} className="font-semibold text-gray-800 hover:text-blue-600 text-left">
                                {categoria.nombre}
                              </button>
                              <ul className="text-sm text-gray-600">
                                {obtenerSubcategoriasPorCategoria(categoria.id).map((sub) => (
                                  <li key={sub.id}>
                                    <button onClick={() => handleSubcategoriaClick(categoria.nombre, sub.nombre)} className="hover:text-blue-600 text-left">
                                      {sub.nombre}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <nav className="flex items-center gap-2 text-gray-700 font-medium ml-2">
                    <button onClick={() => handleNavigate("/")} className="px-3 py-2 hover:text-blue-600">Inicio</button>
                    <button onClick={() => handleNavigate("/catalogo")} className="px-3 py-2 hover:text-blue-600">Productos</button>
                    {rol === "usuario" && (
                      <button onClick={() => handleNavigate("/favoritos")} className="px-3 py-2 hover:text-blue-600">Favoritos</button>
                    )}
                    <button onClick={() => handleNavigate("/contacto")} className="px-3 py-2 hover:text-blue-600">Contacto</button>
                    {rol === "usuario" && (
                      <button onClick={() => handleNavigate("/solicitar-proveedor")} className="px-3 py-2 hover:text-blue-600">Sé Socio</button>
                    )}
                    {!usuario && (
                      <button onClick={onRegisterClick} className="px-3 py-2 hover:text-blue-600">Sé Socio</button>
                    )}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className={`fixed inset-0 z-50 flex justify-start md:hidden transition-visibility duration-300 ${mobileOpen ? "visible" : "invisible pointer-events-none"}`}>
        <div className={`fixed inset-0 bg-black/60 transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setMobileOpen(false)} />

        <div className={`relative w-[85%] max-w-[340px] h-full bg-white shadow-2xl flex flex-col overflow-y-auto transform transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="bg-gray-100 p-4 border-b border-gray-200 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <p className="text-lg font-bold text-gray-800">Hola, {usuario ? usuario.nombre : "Invitado"}</p>
              <button onClick={() => setMobileOpen(false)} className="text-gray-500 hover:text-gray-800 p-1">
                <X size={24} />
              </button>
            </div>

            {usuario ? (
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-600">{usuario.email}</p>
                <div>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border border-blue-200 tracking-wider">
                    {usuario.rol}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mt-1">
                <button onClick={onLoginClick} className="text-sm font-semibold text-blue-600 border-b border-blue-600 pb-0.5">Iniciar sesión</button>
                <span className="text-gray-400">|</span>
                <button onClick={onRegisterClick} className="text-sm font-semibold text-gray-600 hover:text-gray-800">Regístrate</button>
              </div>
            )}
          </div>

          <div className="flex-1 py-2">
            {esProveedor && (
              <div className="border-b border-gray-100 pb-2 mb-2 bg-blue-50/50">
                <p className="px-5 py-2 text-xs font-bold text-blue-800 uppercase tracking-wider">Menú Proveedor</p>
                <button onClick={() => handleNavigate("/proveedor/productos")} className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-blue-100 text-left">
                  <Store size={20} className="text-blue-600" /> <span>Mis Productos</span>
                </button>
                <button onClick={() => handleNavigate("/proveedor/productos/nuevo")} className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-blue-100 text-left">
                  <PlusCircle size={20} className="text-green-600" /> <span>Crear Producto</span>
                </button>
                <button onClick={() => handleNavigate("/ReportesP")} className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-blue-100 text-left">
                  <ClipboardList size={20} className="text-purple-600" /> <span>Reportes</span>
                </button>
              </div>
            )}

            {esAdmin && (
              <div className="border-b border-gray-100 pb-2 mb-2 bg-blue-50/50">
                <p className="px-5 py-2 text-xs font-bold text-blue-800 uppercase tracking-wider">Menú Administrador</p>
                <button onClick={() => handleNavigate("/Administrativa")} className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-blue-100 text-left">
                  <LayoutDashboard size={20} className="text-blue-600" /> <span>Panel Administrativo</span>
                </button>
              </div>
            )}

            {esComprador && (
              <>
                <div className="border-b border-gray-100 pb-2 mb-2">
                  <button onClick={() => handleNavigate("/")} className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 text-left">
                    <Home size={20} className="text-gray-400" /> <span>Inicio</span>
                  </button>
                  <button onClick={() => handleNavigate("/catalogo")} className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 text-left">
                    <Package size={20} className="text-gray-400" /> <span>Productos</span>
                  </button>
                  {rol === "usuario" && (
                    <button onClick={() => handleNavigate("/favoritos")} className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 text-left">
                      <Heart size={20} className="text-red-500" /> <span>Favoritos</span>
                    </button>
                  )}
                  <button onClick={() => handleNavigate("/contacto")} className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 text-left">
                    <Phone size={20} className="text-gray-400" /> <span>Centro de ayuda</span>
                  </button>
                  <button onClick={() => handleNavigate("/carrito")} className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 text-left">
                    <ShoppingCart size={20} className="text-gray-400" /> <span>Carrito</span>
                  </button>
                  {rol === "usuario" && (
                    <button onClick={() => handleNavigate("/mispedidos")} className="w-full flex items-center gap-3 px-5 py-3 text-gray-700 hover:bg-gray-50 text-left">
                      <Package size={20} className="text-gray-400" /> <span>Mis Pedidos</span>
                    </button>
                  )}
                </div>

                <div className="py-2">
                  <p className="px-5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nuestras Categorías</p>
                  {cargandoCategorias ? (
                    <div className="px-5 py-2 text-sm text-gray-500">Cargando...</div>
                  ) : (
                    categorias.map((categoria) => {
                      const subs = obtenerSubcategoriasPorCategoria(categoria.id);
                      const isOpen = expandedCategoryMobile === categoria.id;

                      return (
                        <div key={categoria.id} className="border-b border-gray-50 last:border-0">
                          <div className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 cursor-pointer" onClick={() => toggleMobileCategory(categoria.id)}>
                            <span className={`font-medium ${isOpen ? "text-blue-600" : "text-gray-800"}`}>{categoria.nombre}</span>
                            {isOpen ? <ChevronUp size={16} className="text-blue-600" /> : <ChevronRight size={16} className="text-gray-400" />}
                          </div>

                          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                            <div className="bg-gray-50 px-5 py-2 space-y-2 pb-4">
                              <button onClick={() => handleCategoriaClick(categoria.nombre)} className="block w-full text-left text-sm font-semibold text-gray-800 py-1">
                                Ver todo en {categoria.nombre}
                              </button>
                              {subs.map((sub) => (
                                <button key={sub.id} onClick={() => handleSubcategoriaClick(categoria.nombre, sub.nombre)} className="block w-full text-left text-sm text-gray-600 hover:text-blue-600 py-1 pl-2 border-l-2 border-transparent hover:border-blue-300 transition-colors">
                                  {sub.nombre}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>

          {usuario && (
            <div className="bg-gray-50 p-4 border-t border-gray-200 space-y-3">
              <button onClick={() => handleNavigate("/miperfil")} className="flex items-center gap-3 text-sm font-medium text-gray-700 w-full">
                <UserCircle size={18} /> Mi Perfil
              </button>

              {rol === "usuario" && (
                <>
                  <button onClick={() => handleNavigate("/mispedidos")} className="flex items-center gap-3 text-sm font-medium text-gray-700 w-full">
                    <Package size={18} /> Mis Pedidos
                  </button>
                  <button onClick={() => handleNavigate("/favoritos")} className="flex items-center gap-3 text-sm font-medium text-gray-700 w-full">
                    <Heart size={18} className="text-red-500" /> Mis Favoritos
                  </button>
                  <button onClick={() => handleNavigate("/solicitar-proveedor")} className="flex items-center gap-3 text-sm font-medium text-gray-700 w-full">
                    <Tag size={18} /> Sé Socio
                  </button>
                </>
              )}

              <button onClick={handleCerrarSesion} className="flex items-center gap-3 text-sm font-medium text-red-600 w-full pt-2 mt-2 border-t border-gray-200">
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
