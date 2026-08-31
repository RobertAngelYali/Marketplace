package com.marketplace.backend.repository;

import com.marketplace.backend.dominio.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Buscar usuario por email
    Optional<Usuario> findByEmail(String email);

    // Verificar si existe un email
    boolean existsByEmail(String email);
}
