package com.marketplace.backend.repository;

import com.marketplace.backend.dominio.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    
    // Buscar proveedor por usuario ID
    Optional<Proveedor> findByUsuarioId(Long usuarioId);
    
    // Verificar si existe un proveedor para un usuario
    boolean existsByUsuarioId(Long usuarioId);
    
    // Buscar por RUC
    Optional<Proveedor> findByRuc(String ruc);
    
    // Verificar si existe un RUC
    boolean existsByRuc(String ruc);
    
    // Buscar proveedores por estado
    List<Proveedor> findByEstado(Proveedor.EstadoProveedor estado);
}