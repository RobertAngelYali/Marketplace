package com.marketplace.backend.controller;

import com.marketplace.backend.dto.CambiarEstadoSolicitudStockDTO;
import com.marketplace.backend.dto.CrearSolicitudStockDTO;
import com.marketplace.backend.dto.SolicitudStockDTO;
import com.marketplace.backend.security.JwtUtil;
import com.marketplace.backend.service.SolicitudStockService;
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
public class SolicitudStockController {

    private final SolicitudStockService solicitudStockService;
    private final JwtUtil jwtUtil;

    @PostMapping("/usuario/solicitudes-stock")
    @PreAuthorize("hasAnyRole('USUARIO', 'PROVEEDOR', 'ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> crearSolicitud(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CrearSolicitudStockDTO dto) {

        Map<String, Object> response = new HashMap<>();

        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);

            SolicitudStockDTO solicitud = solicitudStockService.crearSolicitud(usuarioId, dto);

            response.put("success", true);
            response.put("message", "Solicitud enviada al administrador");
            response.put("data", solicitud);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Error al crear solicitud de stock: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/usuario/solicitudes-stock/mis-solicitudes")
    @PreAuthorize("hasAnyRole('USUARIO', 'PROVEEDOR', 'ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> obtenerMisSolicitudes(
            @RequestHeader("Authorization") String authHeader) {

        Map<String, Object> response = new HashMap<>();

        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);

            List<SolicitudStockDTO> solicitudes = solicitudStockService.obtenerMisSolicitudes(usuarioId);

            response.put("success", true);
            response.put("data", solicitudes);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al obtener solicitudes del usuario: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/admin/solicitudes-stock")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> obtenerTodas() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<SolicitudStockDTO> solicitudes = solicitudStockService.obtenerTodas();

            response.put("success", true);
            response.put("data", solicitudes);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al obtener solicitudes de stock: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/admin/solicitudes-stock/pendientes")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> obtenerPendientes() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<SolicitudStockDTO> solicitudes = solicitudStockService.obtenerPendientes();

            response.put("success", true);
            response.put("data", solicitudes);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al obtener solicitudes pendientes de stock: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PatchMapping("/admin/solicitudes-stock/{solicitudId}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Map<String, Object>> cambiarEstado(
            @PathVariable Long solicitudId,
            @Valid @RequestBody CambiarEstadoSolicitudStockDTO dto) {

        Map<String, Object> response = new HashMap<>();

        try {
            SolicitudStockDTO solicitud = solicitudStockService.cambiarEstado(solicitudId, dto);

            response.put("success", true);
            response.put("message", "Estado de solicitud actualizado");
            response.put("data", solicitud);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al cambiar estado de solicitud de stock: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}
