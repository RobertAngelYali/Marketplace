package com.marketplace.backend.controller;
import com.marketplace.backend.dto.LoginDTO;
import com.marketplace.backend.dto.LoginResponseDTO;
import com.marketplace.backend.dominio.Usuario;
import com.marketplace.backend.security.JwtUtil;
import com.marketplace.backend.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
  private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    /**
     * Endpoint para login de usuarios
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDTO) {
        try {
            System.out.println("=== Intento de login ===");
            System.out.println("Email: " + loginDTO.getEmail());
            
            // Buscar usuario por email
            Usuario usuario = usuarioService.buscarPorEmail(loginDTO.getEmail().toLowerCase().trim());
            System.out.println("Usuario encontrado: " + usuario.getNombre());
            
            // Verificar contraseña
            boolean passwordMatch = passwordEncoder.matches(loginDTO.getPassword(), usuario.getPassword());
            System.out.println("Contraseña correcta: " + passwordMatch);
            
            if (!passwordMatch) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "Credenciales inválidas");
                return ResponseEntity.status(401).body(errorResponse);
            }
            
            // Generar token JWT - USAR .getIg() en lugar de .getId()
            System.out.println("Generando token para usuario ID: " + usuario.getId());
            String token = jwtUtil.generarToken(
                usuario.getEmail(),
                usuario.getId(),  // ← CAMBIADO DE getId() A getIg()
                usuario.getRol().name()
            );
            System.out.println("Token generado exitosamente");
            
            // Crear respuesta con token y datos del usuario
            LoginResponseDTO.UsuarioInfo usuarioInfo = new LoginResponseDTO.UsuarioInfo(
                usuario.getId(),  // ← CAMBIADO DE getId() A getIg()
                usuario.getEmail(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getRol()
            );
            
            LoginResponseDTO loginResponse = new LoginResponseDTO(token, usuarioInfo);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login exitoso");
            response.put("data", loginResponse);
            
            System.out.println("=== Login exitoso ===");
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            System.err.println("Error: Usuario no encontrado - " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Credenciales inválidas");
            return ResponseEntity.status(401).body(errorResponse);
        } catch (Exception e) {
            System.err.println("Error inesperado en login: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error interno del servidor");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
