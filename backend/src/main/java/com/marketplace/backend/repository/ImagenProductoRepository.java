package com.marketplace.backend.repository;

import com.marketplace.backend.dominio.ImagenProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImagenProductoRepository extends JpaRepository<ImagenProducto, Long> {
    
    // Buscar imágenes por producto
    List<ImagenProducto> findByProductoId(Long productoId);
    
    // Eliminar todas las imágenes de un producto
    void deleteByProductoId(Long productoId);
    
    // Contar imágenes de un producto
    Long countByProductoId(Long productoId);

    // ⭐ NUEVO: Obtener imágenes de múltiples productos (optimización para detalles de pedido)
    @Query("SELECT i FROM ImagenProducto i WHERE i.producto.id IN :productoIds")
    List<ImagenProducto> findByProductoIdIn(@Param("productoIds") List<Long> productoIds);
}