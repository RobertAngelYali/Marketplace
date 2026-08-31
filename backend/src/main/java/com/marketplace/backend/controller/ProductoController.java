package com.marketplace.backend.controller;

import com.marketplace.backend.dto.*;
import com.marketplace.backend.security.JwtUtil;
import com.marketplace.backend.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ProductoController {
    
    private static final CacheControl PUBLIC_CACHE = CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic();

    private final ProductoService productoService;
    private final JwtUtil jwtUtil;
    
    // ========== ENDPOINTS PARA ADMINISTRADOR ==========

    @GetMapping("/admin/productos/pendientes")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> obtenerProductosPendientes() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<ProductoDTO> productos = productoService.obtenerProductosPendientes();

            response.put("success", true);
            response.put("data", productos);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error al obtener productos pendientes: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Error al obtener productos pendientes");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/admin/productos/stock-bajo")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> obtenerProductosConStockBajo() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<ProductoDTO> productos = productoService.obtenerProductosConStockBajo();

            response.put("success", true);
            response.put("data", productos);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error al obtener productos con stock bajo: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Error al obtener productos con stock bajo");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PatchMapping("/admin/productos/{productoId}/revision")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> cambiarEstadoRevisionProducto(
            @PathVariable Long productoId,
            @Valid @RequestBody CambiarEstadoProductoDTO dto) {

        Map<String, Object> response = new HashMap<>();

        try {
            ProductoDTO producto = productoService.cambiarEstadoRevisionProducto(productoId, dto);

            response.put("success", true);
            response.put("message", "Estado de revisión actualizado exitosamente");
            response.put("data", producto);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Error al cambiar estado de revisión: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }



    // ========== ENDPOINTS PARA PROVEEDORES ==========
    
    /**
     * Crear producto (solo proveedor)
     * POST /api/proveedor/productos
     */
    @PostMapping("/proveedor/productos")
    @PreAuthorize("hasRole('PROVEEDOR')")
    public ResponseEntity<Map<String, Object>> crearProducto(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CrearProductoDTO dto) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);
            
            ProductoDTO producto = productoService.crearProducto(usuarioId, dto);
            
            response.put("success", true);
            response.put("message", "Producto enviado a revisión del administrador");
            response.put("data", producto);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            log.error("Error al crear producto: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Obtener mis productos (proveedor)
     * GET /api/proveedor/productos
     */
    @GetMapping("/proveedor/productos")
    @PreAuthorize("hasRole('PROVEEDOR')")
    public ResponseEntity<Map<String, Object>> obtenerMisProductos(
            @RequestHeader("Authorization") String authHeader) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);
            
            List<ProductoDTO> productos = productoService.obtenerMisProductos(usuarioId);
            
            response.put("success", true);
            response.put("data", productos);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error al obtener productos: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

        /**
        * Obtener mis productos con stock bajo (proveedor)
        * GET /api/proveedor/productos/stock-bajo
        */
    @GetMapping("/proveedor/productos/stock-bajo")
    @PreAuthorize("hasRole('PROVEEDOR')")
    public ResponseEntity<?> obtenerMisProductosConStockBajo(
            @RequestHeader("Authorization") String authHeader) {

        Map<String, Object> response = new HashMap<>();

        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);

            List<ProductoDTO> productos = productoService.obtenerMisProductosConStockBajo(usuarioId);

            response.put("success", true);
            response.put("data", productos);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Error al obtener productos con stock bajo: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Obtener un producto específico del proveedor
     * GET /api/proveedor/productos/{productoId}
     */
    @GetMapping("/proveedor/productos/{productoId}")
    @PreAuthorize("hasRole('PROVEEDOR')")
    public ResponseEntity<Map<String, Object>> obtenerMiProducto(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long productoId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);
            
            ProductoDTO producto = productoService.obtenerMiProducto(usuarioId, productoId);
            
            response.put("success", true);
            response.put("data", producto);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error al obtener producto: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    /**
     * Actualizar producto (proveedor)
     * PUT /api/proveedor/productos/{productoId}
     */
    @PutMapping("/proveedor/productos/{productoId}")
    @PreAuthorize("hasRole('PROVEEDOR')")
    public ResponseEntity<Map<String, Object>> actualizarProducto(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long productoId,
            @Valid @RequestBody ActualizarProductoDTO dto) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);
            
            ProductoDTO producto = productoService.actualizarProducto(usuarioId, productoId, dto);
            
            response.put("success", true);
            response.put("message", "Producto actualizado exitosamente");
            response.put("data", producto);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error al actualizar producto: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Eliminar producto (proveedor)
     * DELETE /api/proveedor/productos/{productoId}
     */
    @DeleteMapping("/proveedor/productos/{productoId}")
    @PreAuthorize("hasRole('PROVEEDOR')")
    public ResponseEntity<Map<String, Object>> eliminarProducto(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long productoId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);
            
            productoService.eliminarProducto(usuarioId, productoId);
            
            response.put("success", true);
            response.put("message", "Producto eliminado exitosamente");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error al eliminar producto: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Agregar imagen a producto (proveedor)
     * POST /api/proveedor/productos/{productoId}/imagenes
     */
    @PostMapping("/proveedor/productos/{productoId}/imagenes")
    @PreAuthorize("hasRole('PROVEEDOR')")
    public ResponseEntity<Map<String, Object>> agregarImagen(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long productoId,
            @Valid @RequestBody ImagenProductoDTO dto) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);
            
            ImagenProductoDTO imagen = productoService.agregarImagen(usuarioId, productoId, dto.getUrlImagen());
            
            response.put("success", true);
            response.put("message", "Imagen agregada exitosamente");
            response.put("data", imagen);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            log.error("Error al agregar imagen: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Eliminar imagen de producto (proveedor)
     * DELETE /api/proveedor/productos/{productoId}/imagenes/{imagenId}
     */
    @DeleteMapping("/proveedor/productos/{productoId}/imagenes/{imagenId}")
    @PreAuthorize("hasRole('PROVEEDOR')")
    public ResponseEntity<Map<String, Object>> eliminarImagen(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long productoId,
            @PathVariable Long imagenId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);
            
            productoService.eliminarImagen(usuarioId, productoId, imagenId);
            
            response.put("success", true);
            response.put("message", "Imagen eliminada exitosamente");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error al eliminar imagen: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    // ========== ENDPOINTS PÚBLICOS ==========
    
    /**
     * Obtener todos los productos disponibles (público)
     * GET /api/public/productos
     */
    @GetMapping("/public/productos")
    public ResponseEntity<Map<String, Object>> obtenerTodosLosProductos() {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<ProductoDTO> productos = productoService.obtenerTodosLosProductos();
            
            response.put("success", true);
            response.put("data", productos);
            
            return ResponseEntity.ok().cacheControl(PUBLIC_CACHE).body(response);
            
        } catch (Exception e) {
            log.error("Error al obtener productos: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Error al obtener productos");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Obtener un producto público por ID con todas sus imágenes.
     * GET /api/public/productos/{productoId}
     */
    @GetMapping("/public/productos/{productoId}")
    public ResponseEntity<Map<String, Object>> obtenerProductoPublicoPorId(
            @PathVariable Long productoId) {

        Map<String, Object> response = new HashMap<>();

        try {
            ProductoDTO producto = productoService.obtenerProductoPublicoPorId(productoId);

            response.put("success", true);
            response.put("data", producto);

            return ResponseEntity.ok().cacheControl(PUBLIC_CACHE).body(response);

        } catch (Exception e) {
            log.error("Error al obtener producto público: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Producto no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    /**
     * Obtener productos por categoría (público)
     * GET /api/public/productos/categoria/{categoriaId}
     */
    @GetMapping("/public/productos/categoria/{categoriaId}")
    public ResponseEntity<Map<String, Object>> obtenerProductosPorCategoria(
            @PathVariable Long categoriaId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<ProductoDTO> productos = productoService.obtenerProductosPorCategoria(categoriaId);
            
            response.put("success", true);
            response.put("data", productos);
            
            return ResponseEntity.ok().cacheControl(PUBLIC_CACHE).body(response);
            
        } catch (Exception e) {
            log.error("Error al obtener productos por categoría: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Error al obtener productos");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}