package com.marketplace.backend.repository;

import com.marketplace.backend.dominio.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    // Buscar productos por proveedor
    List<Producto> findByProveedorId(Long proveedorId);
    
    // Buscar productos por categoría
    List<Producto> findByCategoriaId(Long categoriaId);
    
    // Buscar productos por subcategoría
    List<Producto> findBySubcategoriaId(Long subcategoriaId);
    
    // Buscar productos disponibles
    List<Producto> findByDisponibleTrue();
    
    // Buscar productos por proveedor y disponibilidad
    List<Producto> findByProveedorIdAndDisponibleTrue(Long proveedorId);
    
    // Buscar producto específico de un proveedor
    Optional<Producto> findByIdAndProveedorId(Long productoId, Long proveedorId);
    
    // Buscar por nombre (búsqueda parcial)
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
    
    // Contar productos de un proveedor
    Long countByProveedorId(Long proveedorId);

    // Buscar productos por estado de revisión
    List<Producto> findByEstadoRevision(Producto.EstadoRevision estadoRevision);

    // Buscar productos disponibles por estado de revisión
    List<Producto> findByDisponibleTrueAndEstadoRevision(Producto.EstadoRevision estadoRevision);

    Optional<Producto> findByIdAndDisponibleTrueAndEstadoRevision(
            Long id,
            Producto.EstadoRevision estadoRevision
    );

    // Buscar productos por categoría, disponibles y por estado de revisión
    List<Producto> findByCategoriaIdAndDisponibleTrueAndEstadoRevision(
            Long categoriaId,
            Producto.EstadoRevision estadoRevision
    );

    // Buscar productos por subcategoría, disponibles y por estado de revisión
    List<Producto> findByProveedorIdAndEstadoRevision(
            Long proveedorId,
            Producto.EstadoRevision estadoRevision
    );

    // Buscar productos con stock bajo (stockDisponible <= stockMinimoAlerta)
    @Query("SELECT p FROM Producto p WHERE p.stockDisponible <= p.stockMinimoAlerta AND p.stockDisponible > 0")
    List<Producto> findProductosConStockBajo();

    // Buscar productos con stock bajo por proveedor
    @Query("SELECT p FROM Producto p WHERE p.proveedor.id = :proveedorId AND p.stockDisponible <= p.stockMinimoAlerta AND p.stockDisponible > 0")
    List<Producto> findProductosConStockBajoByProveedorId(Long proveedorId);
}