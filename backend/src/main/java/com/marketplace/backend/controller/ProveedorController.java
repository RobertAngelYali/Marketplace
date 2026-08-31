package com.marketplace.backend.controller;

import com.marketplace.backend.dto.CambiarEstadoProveedorDTO;
import com.marketplace.backend.dto.CambiarRolUsuarioDTO;
import com.marketplace.backend.dto.ProveedorDTO;
import com.marketplace.backend.dto.SolicitudProveedorDTO;
import com.marketplace.backend.security.JwtUtil;
import com.marketplace.backend.service.ProveedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class ProveedorController {
    
    private final ProveedorService proveedorService;
    private final JwtUtil jwtUtil;
    
    // ========== ENDPOINTS PARA USUARIOS ==========
    
    /**
     * Solicitar ser proveedor (usuario autenticado)
     * POST /api/usuario/proveedor/solicitar
     */
    @PostMapping("/usuario/proveedor/solicitar")
    @PreAuthorize("hasAnyRole('USUARIO', 'PROVEEDOR', 'ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> solicitarSerProveedor(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody SolicitudProveedorDTO dto) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Extraer usuario ID del token
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);
            
            log.info("Solicitud de proveedor recibida para usuario: {}", usuarioId);
            
            ProveedorDTO proveedor = proveedorService.solicitarSerProveedor(usuarioId, dto);
            
            response.put("success", true);
            response.put("message", "Solicitud enviada exitosamente. Espera la aprobación del administrador.");
            response.put("data", proveedor);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            log.error("Error al solicitar ser proveedor: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Obtener mi solicitud de proveedor
     * GET /api/usuario/proveedor/mi-solicitud
     */
    @GetMapping("/usuario/proveedor/mi-solicitud")
    @PreAuthorize("hasAnyRole('USUARIO', 'PROVEEDOR', 'ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> obtenerMiSolicitud(
            @RequestHeader("Authorization") String authHeader) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);
            
            ProveedorDTO proveedor = proveedorService.obtenerMiSolicitud(usuarioId);
            
            response.put("success", true);
            response.put("data", proveedor);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error al obtener solicitud: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    /**
     * Verificar si tengo solicitud de proveedor
     * GET /api/usuario/proveedor/verificar
     */
    @GetMapping("/usuario/proveedor/verificar")
    @PreAuthorize("hasAnyRole('USUARIO', 'PROVEEDOR', 'ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> verificarSolicitud(
            @RequestHeader("Authorization") String authHeader) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);
            
            boolean tieneSolicitud = proveedorService.tieneSolicitud(usuarioId);
            
            response.put("success", true);
            response.put("tieneSolicitud", tieneSolicitud);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al verificar solicitud: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Error al verificar solicitud");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    // ========== ENDPOINTS PARA ADMINISTRADOR ==========
    
    /**
     * Obtener todas las solicitudes (admin)
     * GET /api/admin/proveedores/solicitudes
     */
    @GetMapping("/admin/proveedores/solicitudes")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> obtenerTodasLasSolicitudes() {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<ProveedorDTO> solicitudes = proveedorService.obtenerTodasLasSolicitudes();
            
            response.put("success", true);
            response.put("data", solicitudes);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al obtener solicitudes: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Error al obtener solicitudes");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Obtener solicitudes pendientes (admin)
     * GET /api/admin/proveedores/solicitudes/pendientes
     */
    @GetMapping("/admin/proveedores/solicitudes/pendientes")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> obtenerSolicitudesPendientes() {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<ProveedorDTO> solicitudes = proveedorService.obtenerSolicitudesPendientes();
            
            response.put("success", true);
            response.put("data", solicitudes);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error al obtener solicitudes pendientes: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Error al obtener solicitudes pendientes");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Cambiar estado de solicitud (admin)
     * PATCH /api/admin/proveedores/{proveedorId}/estado
     */
    
    @PatchMapping("/admin/proveedores/{proveedorId}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<Map<String, Object>> cambiarEstadoSolicitud(
            @PathVariable Long proveedorId,
            @Valid @RequestBody CambiarEstadoProveedorDTO dto) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            ProveedorDTO proveedor = proveedorService.cambiarEstadoSolicitud(proveedorId, dto.getEstado());
            
            response.put("success", true);
            response.put("message", "Estado actualizado exitosamente");
            response.put("data", proveedor);
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error al cambiar estado: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Cambiar rol de usuario (admin)
     * PATCH /api/admin/usuarios/{usuarioId}/rol
     */
    @PatchMapping("/admin/usuarios/{usuarioId}/rol")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> cambiarRolUsuario(
            @PathVariable Long usuarioId,
            @Valid @RequestBody CambiarRolUsuarioDTO dto) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            proveedorService.cambiarRolUsuario(usuarioId, dto);
            
            response.put("success", true);
            response.put("message", "Rol actualizado exitosamente");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            log.error("Error al cambiar rol: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}