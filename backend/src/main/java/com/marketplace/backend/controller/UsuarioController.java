package com.marketplace.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import com.marketplace.backend.security.JwtUtil;    
import com.marketplace.backend.dominio.Usuario;
import com.marketplace.backend.dto.ActualizarPerfilDTO;

import com.marketplace.backend.dto.RegistroUsuarioDTO;
import com.marketplace.backend.dto.UsuarioResponseDTO;
import com.marketplace.backend.service.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Ajusta esto según tu frontend
public class UsuarioController {
    private final UsuarioService usuarioService;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@Valid @RequestBody RegistroUsuarioDTO dto) {
        try {
            UsuarioResponseDTO usuario = usuarioService.registrarUsuario(dto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Usuario registrado exitosamente");
            response.put("data", usuario);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
    
    /**
     * Endpoint para verificar si un email está disponible
     * GET /api/usuarios/verificar-email?email=ejemplo@mail.com
     */
    @GetMapping("/verificar-email")
    public ResponseEntity<?> verificarEmail(@RequestParam String email) {
        boolean existe = usuarioService.existeEmail(email);
        
        Map<String, Object> response = new HashMap<>();
        response.put("existe", existe);
        response.put("disponible", !existe);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerMiPerfil(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);

            Usuario usuario = usuarioService.obtenerPorId(usuarioId);
            // Por seguridad, devolvemos el objeto. El frontend ignorará el password encriptado.
            return ResponseEntity.ok(usuario);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error de autenticación");
        }
    }

    @PutMapping("/perfil")
    public ResponseEntity<?> actualizarMiPerfil(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody ActualizarPerfilDTO dto) {
        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);

            Usuario usuario = usuarioService.actualizarPerfil(usuarioId, dto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Perfil actualizado correctamente");
            response.put("data", usuario);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al actualizar: " + e.getMessage());
        }
    }
}
