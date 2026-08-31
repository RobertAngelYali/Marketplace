package com.marketplace.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marketplace.backend.dominio.Usuario;
import com.marketplace.backend.dto.RegistroUsuarioDTO;
import com.marketplace.backend.dto.UsuarioResponseDTO;
import com.marketplace.backend.repository.UsuarioRepository;
import com.marketplace.backend.dto.ActualizarPerfilDTO;

@Service
@RequiredArgsConstructor

public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Registra un nuevo usuario en el sistema
     */
    @Transactional
    public UsuarioResponseDTO registrarUsuario(RegistroUsuarioDTO dto) {

        // Validar que el email no esté registrado
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        // Crear el nuevo usuario
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setEmail(dto.getEmail().toLowerCase().trim());
        nuevoUsuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        nuevoUsuario.setNombre(dto.getNombre().trim());
        nuevoUsuario.setApellido(dto.getApellido().trim());

        if (dto.getTelefono() != null && !dto.getTelefono().isEmpty()) {
            nuevoUsuario.setTelefono(dto.getTelefono().trim());
        }

        // El rol se establece por defecto como usuario en la entidad
        nuevoUsuario.setRol(Usuario.RolUsuario.usuario);

        // Guardar en la base de datos
        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        // Retornar DTO sin la contraseña
        return new UsuarioResponseDTO(usuarioGuardado);
    }

    /**
     * Busca un usuario por su email
     */
    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    }

    /**
     * Verifica si un email ya está registrado
     */
    public boolean existeEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    /**
     * Obtener usuario por ID (para el perfil)
     */
    @Transactional(readOnly = true)
    public Usuario obtenerPorId( Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    /**
     * Actualizar datos del perfil
     */
    @Transactional
    public Usuario actualizarPerfil( Long id, ActualizarPerfilDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(dto.getNombre().trim());
        usuario.setApellido(dto.getApellido().trim());

        if (dto.getTelefono() != null) {
            usuario.setTelefono(dto.getTelefono().trim());
        }

        return usuarioRepository.save(usuario);
    }
}
