package com.marketplace.backend.repository;

import com.marketplace.backend.dominio.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, Long> {
    List<Favorito> findByUsuarioIdOrderByFechaAgregadoDesc(Long usuarioId);

    Optional<Favorito> findByUsuarioIdAndProductoId(Long usuarioId, Long productoId);

    boolean existsByUsuarioIdAndProductoId(Long usuarioId, Long productoId);

    long countByUsuarioId(Long usuarioId);
}
