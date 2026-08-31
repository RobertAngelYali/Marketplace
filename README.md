# Proyecto Marketplace - Faraón

Un marketplace moderno y sostenible desarrollado con Spring Boot (backend) y React (frontend), diseñado para conectar proveedores y consumidores de productos ecoamigables.

## 📋 Descripción del Proyecto

Este proyecto es un marketplace completo que permite a los usuarios explorar, comprar y vender productos sostenibles. El sistema incluye autenticación de usuarios, gestión de productos, categorías, pedidos y un panel administrativo.

### Características Principales

- **Frontend (React + Vite + Tailwind CSS)**
  - Interfaz moderna y responsiva
  - Sistema de autenticación con JWT
  - Catálogo de productos con filtros avanzados y paginación
  - Integración con API de categorías y subcategorías
  - Carrito de compras
  - Páginas de perfil de usuario
  - Diseño adaptativo para móviles y desktop

- **Backend (Spring Boot + MySQL)**
  - API RESTful
  - Autenticación y autorización con JWT (roles: USUARIO, PROVEEDOR, ADMINISTRADOR)
  - Gestión de usuarios, productos, pedidos, categorías y subcategorías
  - Base de datos MySQL
  - Validación de datos
  - Manejo de errores global
  - Endpoints públicos para categorías y subcategorías

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19.2.0** - Framework principal
- **Vite** - Build tool y dev server
- **React Router DOM** - Navegación
- **Tailwind CSS 4.1.17** - Estilos
- **Lucide React** - Iconos
- **React Hot Toast** - Notificaciones

### Backend
- **Spring Boot 3.5.7** - Framework principal
- **Java 21** - Lenguaje de programación
- **Spring Data JPA** - Persistencia de datos
- **MySQL** - Base de datos
- **Spring Security** - Autenticación y autorización
- **JWT** - Tokens de autenticación
- **Lombok** - Reducción de código boilerplate

## 📁 Estructura del Proyecto

```
Proyecto_Marketplace/
├── backend/                          # API REST con Spring Boot
│   ├── src/main/java/com/marketplace/backend/
│   │   ├── BackendApplication.java   # Clase principal
│   │   ├── config/                   # Configuraciones
│   │   │   ├── DatabaseConnectionTest.java
│   │   │   ├── SecurityConfig.java
│   │   ├── controller/               # Controladores REST
│   │   │   ├── AuthController.java
│   │   │   ├── UsuarioController.java
│   │   ├── dominio/                  # Entidades JPA
│   │   │   ├── Usuario.java
│   │   │   ├── Producto.java
│   │   │   ├── Categoria.java
│   │   │   ├── Subcategoria.java
│   │   │   ├── Pedido.java
│   │   │   ├── DetallePedido.java
│   │   │   ├── Carrito.java
│   │   │   ├── ImagenProducto.java
│   │   │   ├── Proveedor.java
│   │   │   └── Resena.java
│   │   ├── dto/                      # Data Transfer Objects
│   │   │   ├── LoginDTO.java
│   │   │   ├── LoginResponseDTO.java
│   │   │   ├── RegistroUsuarioDTO.java
│   │   │   └── UsuarioResponseDTO.java
│   │   ├── exception/                # Manejo de excepciones
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── repository/               # Repositorios JPA
│   │   │   └── UsuarioRepository.java
│   │   ├── security/                 # Configuración de seguridad
│   │   │   └── JwtUtil.java
│   │   └── service/                  # Lógica de negocio
│   │       └── UsuarioService.java
│   └── src/main/resources/
│       └── application.properties    # Configuración de la aplicación
├── frontend/                         # Aplicación React
│   ├── src/
│   │   ├── components/               # Componentes reutilizables
│   │   │   ├── Navbar.jsx            # Barra de navegación
│   │   │   ├── Footer.jsx            # Pie de página
│   │   │   ├── Hero.jsx              # Sección hero
│   │   │   ├── LoginModal.jsx        # Modal de login
│   │   │   ├── RegistroModal.jsx     # Modal de registro
│   │   │   └── Modal.jsx             # Componente modal base
│   │   ├── pages/                    # Páginas de la aplicación
│   │   │   ├── Home.jsx              # Página principal
│   │   │   ├── Catalogo.jsx          # Catálogo de productos
│   │   │   ├── Miperfil.jsx          # Perfil de usuario (404)
│   │   │   ├── Administrativa.jsx    # Panel administrativo (404)
│   │   │   ├── Carrito.jsx           # Carrito de compras (404)
│   │   │   ├── Contacto.jsx          # Página de contacto (404)
│   │   │   ├── Mispedidos.jsx        # Mis pedidos (404)
│   │   │   └── vista_producto.jsx    # Vista de producto (404)
│   │   ├── services/                 # Servicios para API
│   │   │   ├── authService.js        # Servicio de autenticación
│   │   │   └── usuarioService.js     # Servicio de usuarios
│   │   ├── config/                   # Configuraciones
│   │   │   └── api.js                # Configuración de API
│   │   ├── App.jsx                   # Componente principal
│   │   └── main.jsx                  # Punto de entrada
│   ├── package.json                  # Dependencias del frontend
│   └── vite.config.js                # Configuración de Vite
└── README.md                         # Este archivo
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Java 21** o superior
- **Node.js 18+** y **npm**
- **MySQL 8.0+**
- **Maven 3.6+**

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd Proyecto_Marketplace
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
npm run dev      # Inicia el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm run preview  # Vista previa de la build de producción
npm run lint     # Ejecuta el linter
```

### Backend

```bash
mvn clean install          # Instala dependencias
mvn spring-boot:run        # Ejecuta la aplicación
mvn test                   # Ejecuta los tests
```

## 🌐 Uso de la Aplicación

### Páginas Disponibles

- **/** - Página principal con productos destacados
- **/catalogo** - Catálogo completo con filtros y paginación

### Páginas en Desarrollo (404)

Las siguientes páginas muestran un mensaje de "en construcción":
- **/Miperfil** - Perfil de usuario
- **/Administrativa** - Panel administrativo
- **/Carrito** - Carrito de compras
- **/Contacto** - Página de contacto
- **/Mispedidos** - Historial de pedidos
- **/vista_producto** - Vista detallada de producto

### Funcionalidades Implementadas

#### Frontend
- ✅ Navegación responsive
- ✅ Sistema de autenticación (login/registro)
- ✅ Catálogo de productos con filtros avanzados (categorías, subcategorías, precio, popularidad)
- ✅ Integración con API de categorías y subcategorías desde la base de datos
- ✅ Paginación (15 productos por página)
- ✅ Botón de scroll to top
- ✅ Diseño moderno con Tailwind CSS

#### Backend
- ✅ API RESTful
- ✅ Autenticación JWT con roles (USUARIO, PROVEEDOR, ADMINISTRADOR)
- ✅ Gestión de usuarios, categorías y subcategorías
- ✅ Endpoints públicos para categorías y subcategorías
- ✅ Conexión a base de datos MySQL
- ✅ Validación de datos
- ✅ Manejo de errores
- ✅ Configuración de seguridad con Spring Security

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación. Los tokens se almacenan en el localStorage del navegador.

### Endpoints de Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar nuevo usuario

### Endpoints Públicos

- `GET /api/public/categorias` - Obtener todas las categorías
- `GET /api/public/categorias/subcategorias` - Obtener todas las subcategorías
- `GET /api/public/categorias/{categoriaId}/subcategorias` - Obtener subcategorías por categoría

## 📊 Base de Datos

### Entidades Principales

- **Usuario**: Información de usuarios registrados
- **Producto**: Catálogo de productos
- **Categoria/Subcategoria**: Clasificación de productos
- **Pedido/DetallePedido**: Sistema de pedidos
- **Carrito**: Carrito de compras
- **Proveedor**: Información de proveedores
- **Resena**: Sistema de reseñas
- **ImagenProducto**: Imágenes de productos

## 🤝 Contribución

1. Para poder realizar cambios en el proyecto realiza:
2. Crea una rama para tu trabajo (`git checkout -b nombre-de-la-rama`)
3. Realiza todos los cambios que tienes que hacer
4. Añade todos los datos editados (`git add .`)
5. Commit tus cambios (`git commit -m 'descripción corta del cambio'`)
6. Push a la rama (`git push -u origin nombre-de-la-rama`)
7. Abre un Pull Request en el repositorio de github

Una vez mergeado el trabajo en el repositorio, realiza lo siguiente
1. vuelve a la rama main (`git checkout main`) 🛑🛑IMPORTANTE
2. No se mostraran los cambios de tu rama, para ver los cambios ejecuta (`git pull origin main`) 
3. Verifica que estas en la rama main (`git status`)

## 📝 Licencia

Este proyecto esta realizado por el grupo 2 de innovación

## 👥 Autor

- Carlos Daniel Pure Tocre
- Efrain Alfredo Hinostroza Otazu
- Carlos Daniel Huaman Vega
- Robert Angel Yali Blanco

## 🙏 Agradecimientos

- Profesor por la guía y enseñanza
- Comunidad de desarrollo por las herramientas y recursos
- Equipo de desarrollo por el trabajo colaborativo
- A la ia por ayudarnos a desarrollar unas que otras funciones, pa que mentir profe nadie programa hoy en dia sin ia

---

**Nota**: Este proyecto está en desarrollo activo. Algunas funcionalidades pueden estar incompletas o sujetas a cambios.
