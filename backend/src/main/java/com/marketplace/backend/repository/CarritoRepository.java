package com.marketplace.backend.repository;

import com.marketplace.backend.dominio.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Long> {

    /**
     * Buscar todos los items del carrito de un usuario
     */
    List<Carrito> findByUsuarioId(Long usuarioId);

    /**
     * Buscar un item específico del carrito por usuario y producto
     */
    Optional<Carrito> findByUsuarioIdAndProductoId(Long usuarioId, Long productoId);

    /**
     * Verificar si existe un item en el carrito
     */
    boolean existsByUsuarioIdAndProductoId(Long usuarioId, Long productoId);

    /**
     * Eliminar todos los items del carrito de un usuario
     */
    void deleteByUsuarioId(Long usuarioId);

    /**
     * Contar items en el carrito de un usuario
     */
    Long countByUsuarioId(Long usuarioId);

    /**
     * Obtener items del carrito con productos disponibles
     */
    @Query("SELECT c FROM Carrito c WHERE c.usuario.id = :usuarioId AND c.producto.disponible = true")
    List<Carrito> findByUsuarioIdWithAvailableProducts(@Param("usuarioId") Long usuarioId);

    /**
     * Eliminar items de productos no disponibles
     */
    @Modifying // Indica que es una consulta de modificación (DELETE, UPDATE)
    @Transactional // Requerido para ejecutar cambios en la BD
    @Query("DELETE FROM Carrito c WHERE c.usuario.id = :usuarioId AND c.producto.disponible = false")
    void deleteUnavailableProductsByUsuarioId(@Param("usuarioId") Long usuarioId);

}
