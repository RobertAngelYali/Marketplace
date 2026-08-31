package com.marketplace.backend.controller;

import com.marketplace.backend.dto.FavoritoDTO;
import com.marketplace.backend.security.JwtUtil;
import com.marketplace.backend.service.FavoritoService;
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
@RequestMapping("/api/usuario/favoritos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class FavoritoController {

    private final FavoritoService favoritoService;
    private final JwtUtil jwtUtil;

    @GetMapping
    @PreAuthorize("hasRole('USUARIO')")
    public ResponseEntity<Map<String, Object>> obtenerMisFavoritos(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long usuarioId = obtenerUsuarioId(authHeader);
            List<FavoritoDTO> favoritos = favoritoService.obtenerMisFavoritos(usuarioId);
            response.put("success", true);
            response.put("data", favoritos);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al obtener favoritos: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/ids")
    @PreAuthorize("hasRole('USUARIO')")
    public ResponseEntity<Map<String, Object>> obtenerIdsFavoritos(@RequestHeader("Authorization") String authHeader) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long usuarioId = obtenerUsuarioId(authHeader);
            List<Long> ids = favoritoService.obtenerIdsFavoritos(usuarioId);
            response.put("success", true);
            response.put("data", ids);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al obtener ids favoritos: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/{productoId}/existe")
    @PreAuthorize("hasRole('USUARIO')")
    public ResponseEntity<Map<String, Object>> verificarFavorito(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long productoId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long usuarioId = obtenerUsuarioId(authHeader);
            boolean favorito = favoritoService.esFavorito(usuarioId, productoId);
            response.put("success", true);
            response.put("data", favorito);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al verificar favorito: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/{productoId}")
    @PreAuthorize("hasRole('USUARIO')")
    public ResponseEntity<Map<String, Object>> agregarFavorito(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long productoId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long usuarioId = obtenerUsuarioId(authHeader);
            FavoritoDTO favorito = favoritoService.agregarFavorito(usuarioId, productoId);
            response.put("success", true);
            response.put("message", "Producto agregado a favoritos");
            response.put("data", favorito);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Error al agregar favorito: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @DeleteMapping("/{productoId}")
    @PreAuthorize("hasRole('USUARIO')")
    public ResponseEntity<Map<String, Object>> eliminarFavorito(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long productoId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long usuarioId = obtenerUsuarioId(authHeader);
            favoritoService.eliminarFavorito(usuarioId, productoId);
            response.put("success", true);
            response.put("message", "Producto eliminado de favoritos");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al eliminar favorito: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/{productoId}/toggle")
    @PreAuthorize("hasRole('USUARIO')")
    public ResponseEntity<Map<String, Object>> alternarFavorito(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long productoId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long usuarioId = obtenerUsuarioId(authHeader);
            Map<String, Object> resultado = favoritoService.alternarFavorito(usuarioId, productoId);
            response.put("success", true);
            response.put("message", resultado.get("message"));
            response.put("data", resultado);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error al alternar favorito: {}", e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    private Long obtenerUsuarioId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Token de autenticación inválido");
        }
        String token = authHeader.substring(7);
        return jwtUtil.extraerUserId(token);
    }
}
