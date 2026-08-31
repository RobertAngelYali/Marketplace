package com.marketplace.backend.repository;

import com.marketplace.backend.dominio.Resena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Long> {
    List<Resena> findByProductoIdOrderByFechaResenaDesc(Long productoId);

    Optional<Resena> findByProductoIdAndUsuarioId(Long productoId, Long usuarioId);

    boolean existsByProductoIdAndUsuarioId(Long productoId, Long usuarioId);

    @Query("SELECT COALESCE(AVG(r.calificacion), 0) FROM Resena r WHERE r.producto.id = :productoId")
    Double obtenerPromedioCalificacion(@Param("productoId") Long productoId);
}
