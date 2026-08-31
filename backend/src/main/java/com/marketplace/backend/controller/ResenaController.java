package com.marketplace.backend.controller;

import com.marketplace.backend.dto.CrearResenaDTO;
import com.marketplace.backend.dto.ResenaDTO;
import com.marketplace.backend.security.JwtUtil;
import com.marketplace.backend.service.ResenaService;
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
public class ResenaController {
    private final ResenaService resenaService;
    private final JwtUtil jwtUtil;

    @GetMapping("/public/productos/{productoId}/resenas")
    public ResponseEntity<?> listarResenas(@PathVariable Long productoId) {
        Map<String, Object> response = new HashMap<>();

        try {
            List<ResenaDTO> resenas = resenaService.listarPorProducto(productoId);
            response.put("success", true);
            response.put("data", resenas);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            log.error("Error al listar reseñas: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Error al listar comentarios");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/usuario/productos/{productoId}/resenas")
    @PreAuthorize("hasAnyRole('USUARIO', 'PROVEEDOR', 'ADMINISTRADOR')")
    public ResponseEntity<?> crearResena(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long productoId,
            @Valid @RequestBody CrearResenaDTO dto) {

        Map<String, Object> response = new HashMap<>();

        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);
            ResenaDTO resena = resenaService.crearResena(usuarioId, productoId, dto);

            response.put("success", true);
            response.put("message", "Comentario publicado correctamente");
            response.put("data", resena);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            log.error("Error al crear reseña: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "Error al publicar comentario");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
