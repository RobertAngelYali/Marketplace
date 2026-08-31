package com.marketplace.backend.controller;

import com.marketplace.backend.dto.AgregarCarritoDTO;
import com.marketplace.backend.dto.ActualizarCantidadDTO;
import com.marketplace.backend.dto.CarritoItemDTO;
import com.marketplace.backend.dto.CarritoResumenDTO;
import com.marketplace.backend.security.JwtUtil;
import com.marketplace.backend.service.CarritoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/usuario/carrito")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class CarritoController {
    private final CarritoService carritoService;
    private final JwtUtil jwtUtil;

    /**
     * Agregar producto al carrito
     * POST /api/usuario/carrito
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USUARIO', 'PROVEEDOR', 'ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> agregarProducto(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody AgregarCarritoDTO dto) {

        Map<String, Object> response = new HashMap<>();

        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);

            CarritoItemDTO item = carritoService.agregarProducto(usuarioId, dto);

            response.put("success", true);
            response.put("message", "Producto agregado al carrito");
            response.put("data", item);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            log.error("Error al agregar producto al carrito: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Obtener mi carrito
     * GET /api/usuario/carrito
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USUARIO', 'PROVEEDOR', 'ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> obtenerCarrito(
            @RequestHeader("Authorization") String authHeader) {

        Map<String, Object> response = new HashMap<>();

        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);

            CarritoResumenDTO carrito = carritoService.obtenerCarrito(usuarioId);

            response.put("success", true);
            response.put("data", carrito);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Error al obtener carrito: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Contar items en el carrito
     * GET /api/usuario/carrito/count
     */
    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('USUARIO', 'PROVEEDOR', 'ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> contarItems(
            @RequestHeader("Authorization") String authHeader) {

        Map<String, Object> response = new HashMap<>();

        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);

            Long count = carritoService.contarItems(usuarioId);

            response.put("success", true);
            response.put("count", count);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Error al contar items: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Actualizar cantidad de un producto
     * PUT /api/usuario/carrito/{carritoId}
     */
    @PutMapping("/{carritoId}")
    @PreAuthorize("hasAnyRole('USUARIO', 'PROVEEDOR', 'ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> actualizarCantidad(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long carritoId,
            @Valid @RequestBody ActualizarCantidadDTO dto) {

        Map<String, Object> response = new HashMap<>();

        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);

            CarritoItemDTO item = carritoService.actualizarCantidad(usuarioId, carritoId, dto);

            response.put("success", true);
            response.put("message", "Cantidad actualizada");
            response.put("data", item);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Error al actualizar cantidad: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Eliminar un producto del carrito
     * DELETE /api/usuario/carrito/{carritoId}
     */
    @DeleteMapping("/{carritoId}")
    @PreAuthorize("hasAnyRole('USUARIO', 'PROVEEDOR', 'ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> eliminarProducto(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long carritoId) {

        Map<String, Object> response = new HashMap<>();

        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);

            carritoService.eliminarProducto(usuarioId, carritoId);

            response.put("success", true);
            response.put("message", "Producto eliminado del carrito");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Error al eliminar producto: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Vaciar carrito completo
     * DELETE /api/usuario/carrito
     */
    @DeleteMapping
    @PreAuthorize("hasAnyRole('USUARIO', 'PROVEEDOR', 'ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> vaciarCarrito(
            @RequestHeader("Authorization") String authHeader) {

        Map<String, Object> response = new HashMap<>();

        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);

            carritoService.vaciarCarrito(usuarioId);

            response.put("success", true);
            response.put("message", "Carrito vaciado exitosamente");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Error al vaciar carrito: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Limpiar productos no disponibles
     * POST /api/usuario/carrito/limpiar
     */
    @PostMapping("/limpiar")
    @PreAuthorize("hasAnyRole('USUARIO', 'PROVEEDOR', 'ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> limpiarNoDisponibles(
            @RequestHeader("Authorization") String authHeader) {

        Map<String, Object> response = new HashMap<>();

        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);

            carritoService.limpiarProductosNoDisponibles(usuarioId);

            response.put("success", true);
            response.put("message", "Productos no disponibles eliminados");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Error al limpiar productos: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
