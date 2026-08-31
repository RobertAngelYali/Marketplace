# Proyecto Marketplace - Tienda Don Pepito

Un marketplace moderno y optimizado desarrollado con **Spring Boot** (backend) y **React** (frontend), diseñado para la compra, venta y gestión integral de productos con múltiples roles de usuario (Cliente, Proveedor y Administrador).

---

## 📋 Descripción del Proyecto

Este proyecto es una plataforma de comercio electrónico completa que conecta a clientes con proveedores. Incluye autenticación mediante JWT, catálogo interactivo con filtros, sistema de carrito de compras, checkout con generación de boletas en PDF, gestión de favoritos, módulo de proveedores con control de stock y un panel de administración con reportes y analítica de ventas.

### Características Principales

- **Frontend (React + Vite + Tailwind CSS)**
  - Interfaz moderna, modular y totalmente responsiva.
  - Autenticación y registro con modales dinámicos y validación de formularios.
  - Catálogo interactivo con barra de búsqueda (`SearchBar`), filtrado por categorías/subcategorías y ordenamiento.
  - Carrito de compras global reactivo mediante Context API (`CartContext`).
  - Proceso de checkout con emisión y descarga de comprobantes en PDF (`boletaPdfService`).
  - Módulo de usuario: perfil, historial de compras (`Mispedidos`), favoritos (`MisFavoritos`) y detalle de pedidos.
  - Módulo de proveedor: publicación y edición de productos, solicitud de stock, gestión de inventario y panel de ventas (`MisVentas`, `reportesP`).
  - Panel administrativo para control de usuarios, auditoría de proveedores y gestión global.
  - Rutas protegidas basadas en roles (`ProtectedRoute`).

- **Backend (Spring Boot + MySQL + Spring Security)**
  - Arquitectura en capas limpia y desacoplada (Controller, Service, Repository, DTO, Domain).
  - API RESTful con endpoints protegidos y públicos.
  - Seguridad y control de acceso basado en roles con JWT y `JwtAuthenticationFilter`.
  - Hashing seguro de contraseñas con `BCryptPasswordEncoder`.
  - Gestión integral de entidades: Usuarios, Productos, Proveedores, Pedidos, Ventas, Stock, Reseñas y Favoritos.
  - Manejo global centralizado de excepciones (`GlobalExceptionHandler`).
  - Validación de datos mediante DTOs específicos para cada operación.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19 / 18** - Biblioteca principal de interfaz de usuario
- **Vite** - Empaquetador y entorno de desarrollo ultra rápido
- **React Router DOM** - Enrutamiento dinámico y protección de rutas
- **Tailwind CSS** - Framework de utilidades CSS para diseño responsivo
- **Context API & Hooks** - Gestión global del estado del carrito y autenticación
- **jsPDF / Servicios PDF** - Generación y descarga de boletas electrónicas

### Backend
- **Spring Boot 3.x** - Framework backend principal
- **Java 17 / 21** - Lenguaje de programación
- **Spring Data JPA / Hibernate** - Mapeo objeto-relacional y persistencia
- **Spring Security** - Seguridad, autenticación y autorización
- **JWT (JSON Web Tokens)** - Autenticación basada en tokens sin estado
- **MySQL** - Motor de base de datos relacional
- **Lombok** - Optimización y reducción de código boilerplate
- **Maven** - Gestor de dependencias y construcción del proyecto

---

## 📁 Estructura del Proyecto

```
Tienda_Don_Pepito_Optimizado/
├── backend/                                   # API REST con Spring Boot
│   ├── src/main/java/com/marketplace/backend/
│   │   ├── BackendApplication.java            # Clase principal
│   │   ├── config/                            # Configuraciones de seguridad y BD
│   │   │   ├── DatabaseConnectionTest.java
│   │   │   ├── FavoritosTableInitializer.java
│   │   │   └── SecurityConfig.java
│   │   ├── controller/                        # Controladores REST
│   │   │   ├── AdminUsuarioController.java
│   │   │   ├── AuthController.java
│   │   │   ├── CarritoController.java
│   │   │   ├── CategoriaController.java
│   │   │   ├── FavoritoController.java
│   │   │   ├── PedidoController.java
│   │   │   ├── ProductoController.java
│   │   │   ├── ProveedorController.java
│   │   │   ├── ResenaController.java
│   │   │   ├── SolicitudStockController.java
│   │   │   ├── UsuarioController.java
│   │   │   └── VentaController.java
│   │   ├── dominio/                           # Entidades JPA (Modelos)
│   │   │   ├── Carrito.java
│   │   │   ├── Categoria.java
│   │   │   ├── DetallePedido.java
│   │   │   ├── Favorito.java
│   │   │   ├── ImagenProducto.java
│   │   │   ├── Pedido.java
│   │   │   ├── Producto.java
│   │   │   ├── Proveedor.java
│   │   │   ├── Resena.java
│   │   │   ├── SolicitudStock.java
│   │   │   ├── Subcategoria.java
│   │   │   └── Usuario.java
│   │   ├── dto/                               # Data Transfer Objects (Requests & Responses)
│   │   │   ├── ActualizarPerfilDTO.java
│   │   │   ├── ActualizarProductoDTO.java
│   │   │   ├── AgregarCarritoDTO.java
│   │   │   ├── CarritoItemDTO.java
│   │   │   ├── CrearPedidoDTO.java
│   │   │   ├── CrearProductoDTO.java
│   │   │   ├── LoginDTO.java
│   │   │   ├── LoginResponseDTO.java
│   │   │   ├── RegistroUsuarioDTO.java
│   │   │   ├── SolicitudStockDTO.java
│   │   │   └── ...
│   │   ├── exception/                         # Control de errores y excepciones
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── repository/                        # Interfaces Spring Data JPA
│   │   │   ├── CarritoRepository.java
│   │   │   ├── CategoriaRepository.java
│   │   │   ├── PedidoRepository.java
│   │   │   ├── ProductoRepository.java
│   │   │   ├── ProveedorRepository.java
│   │   │   ├── UsuarioRepository.java
│   │   │   └── ...
│   │   ├── security/                          # Utilidades y filtros JWT
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   └── JwtUtil.java
│   │   └── service/                           # Lógica de negocio
│   │       ├── CarritoService.java
│   │       ├── PedidoService.java
│   │       ├── ProductoService.java
│   │       ├── ProveedorService.java
│   │       ├── UsuarioService.java
│   │       ├── VentaService.java
│   │       └── ...
│   └── src/main/resources/
│       └── application.properties             # Parámetros de configuración y BD
├── frontend/                                  # SPA desarrollada con React + Vite
│   ├── src/
│   │   ├── components/                        # Componentes UI reutilizables
│   │   │   ├── Navbar.jsx
│   │   │   ├── footer.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── LoginModal.jsx
│   │   │   ├── RegistroModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/                           # Contextos globales
│   │   │   └── CartContext.jsx
│   │   ├── pages/                             # Vistas de la aplicación
│   │   │   ├── Home.jsx
│   │   │   ├── Catalogo.jsx
│   │   │   ├── vista_producto.jsx
│   │   │   ├── Carrito.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Miperfil.jsx
│   │   │   ├── MisFavoritos.jsx
│   │   │   ├── Mispedidos.jsx
│   │   │   ├── DetallePedido.jsx
│   │   │   ├── Misproductos.jsx
│   │   │   ├── CrearProducto.jsx
│   │   │   ├── EditarProducto.jsx
│   │   │   ├── MisVentas.jsx
│   │   │   ├── reportesP.jsx
│   │   │   ├── SolicitarProveedor.jsx
│   │   │   ├── Contacto.jsx
│   │   │   └── Administrativa.jsx
│   │   ├── services/                          # Cliente HTTP y llamadas a la API
│   │   │   ├── authService.js
│   │   │   ├── productoService.js
│   │   │   ├── cartService.js
│   │   │   ├── pedidoService.js
│   │   │   ├── boletaPdfService.js
│   │   │   └── ...
│   │   ├── utils/                             # Validaciones y utilitarios
│   │   │   ├── formValidation.js
│   │   │   └── imageUtils.js
│   │   ├── App.jsx                            # Definición de rutas principales
│   │   └── main.jsx                           # Punto de entrada frontend
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Java 17 / 21** instalado
- **Node.js 18+** y gestor de paquetes **npm**
- **MySQL 8.0+** en ejecución
- **Maven 3.8+** (o usar el wrapper `./mvnw`)

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd Tienda_Don_Pepito_Optimizado
```

### 2. Configurar la Base de Datos

1. Instalar y ejecutar MySQL
2. Crear la base de datos:

```sql
CREATE DATABASE marketplace;
```

3. Actualizar las credenciales en `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/marketplace
spring.datasource.username=tu_usuario
spring.datasource.password=tu_contraseña
```

### 3. Configurar el Backend

1. Navegar al directorio del backend:

```bash
cd backend
```

2. Instalar dependencias con Maven:

```bash
mvn clean install
```

3. Ejecutar la aplicación:

```bash
mvn spring-boot:run
```

El backend estará disponible en `http://localhost:8080`

### 4. Configurar el Frontend

1. Abrir una nueva terminal y navegar al directorio del frontend:

```bash
cd frontend
```

2. Instalar dependencias:

```bash
npm install
```

3. Ejecutar la aplicación en modo desarrollo:

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 🔧 Scripts Disponibles

### Frontend

```bash
npm run dev       # Inicia el servidor de desarrollo local con Hot Reload
npm run build     # Compila y optimiza la aplicación para producción en /dist
npm run preview   # Previsualiza la compilación de producción localmente
npm run lint      # Ejecuta el análisis estático de código con ESLint
```

### Backend

```bash
mvn clean install   # Descarga dependencias y compila los paquetes
mvn spring-boot:run # Inicia el backend de Spring Boot
mvn test            # Ejecuta las pruebas unitarias y de integración
```

## 🌐 Módulos y Uso de la Aplicación

### Vistas Públicas y de Clientes

- **/** - Página de inicio con productos destacados y banners informativos.
- **/catalogo** - Exploración general con filtros dinámicos por categorías, precios y búsqueda en tiempo real.
- **/vista_producto** - Información detallada del producto, stock disponible y valoraciones.
- **/Carrito** - Gestión de productos añadidos, actualización de cantidades y cálculo de importes.
- **/Checkout** - Proceso de compra con confirmación y emisión de boleta en PDF.
- **/Miperfil** - Gestión de datos personales y actualización de contraseña.
- **/MisFavoritos** - Listado personalizado de artículos guardados.
- **/Mispedidos** & **/DetallePedido** - Seguimiento del estado de compras e historial.

### Vistas para Proveedores y Administración

- **/SolicitarProveedor** - Formulario de postulación para ser habilitado como vendedor.
- **/Misproductos** - Panel del proveedor para auditar su catálogo activo.
- **/CrearProducto** & **/EditarProducto** - Módulo de alta y actualización de artículos.
- **/MisVentas** & **/reportesP**: Métricas de rendimiento comercial y control de pedidos despachados.
- **/Administrativa** - Panel para la gestión de usuarios, roles y moderación de solicitudes.

## 🔐 Autenticación y Endpoints Principales

La autenticación utiliza tokens JWT, almacenados en el cliente para autorizar peticiones protegidas.

### Endpoints de Autenticación

- `POST /api/auth/login` - Inicio de sesión y entrega de token JWT con rol
- `POST /api/auth/register` - Registro de nuevos usuarios

### Endpoints Principales del Sistema

- `GET /api/public/categorias` - Obtención pública de categorías y subcategorías.
- `GET /api/productos` - Catálogo de productos disponibles.
- `POST /api/pedidos` - Generación y registro de una nueva orden de compra.
- `GET /api/favoritos` - Consulta de lista de deseos del usuario logueado.
- `POST /api/solicitudes-stock` - Gestión de reabastecimiento para proveedores.

## 📊 Base de Datos

### Entidades Principales

- **Usuario**: Datos de cuenta, rol (USUARIO, PROVEEDOR, ADMINISTRADOR) y perfil.
- **Producto**: Catálogo general, precio, descripción, stock y estado de revisión.
- **Categoria / Subcategoria**: Estructura jerárquica para la clasificación de inventario.
- **Pedido / DetallePedido**: Registro de transacciones comerciales y desglose de items.
- **Carrito**: Persistencia de productos preseleccionados por usuario.
- **Proveedor**: Información de negocio, estado y validación comercial.
- **Favorito**: Artículos guardados en la lista de deseos.
- **Resena**: Puntuaciones y comentarios de los clientes sobre los productos.
- **SolicitudStock**: Flujo de solicitud y aprobación de inventario adicional.