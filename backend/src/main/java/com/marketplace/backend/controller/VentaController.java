package com.marketplace.backend.controller;

import com.marketplace.backend.dto.VentaDTO;
import com.marketplace.backend.security.JwtUtil;
import com.marketplace.backend.service.VentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedor/ventas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VentaController {

    private final VentaService ventaService;
    private final JwtUtil jwtUtil;

    @GetMapping
    @PreAuthorize("hasRole('PROVEEDOR')") // Solo proveedores pueden ver esto
    public ResponseEntity<List<VentaDTO>> obtenerMisVentas(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        Long usuarioId = jwtUtil.extraerUserId(token);

        List<VentaDTO> ventas = ventaService.obtenerVentasPorProveedor(usuarioId);
        return ResponseEntity.ok(ventas);
    }
}