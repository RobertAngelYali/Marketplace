package com.marketplace.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.marketplace.backend.dominio.Usuario;
import com.marketplace.backend.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminUsuarioController {
      private final UsuarioRepository usuarioRepository;

    @GetMapping("/lista")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        return ResponseEntity.ok(usuarios);
    }  
}
