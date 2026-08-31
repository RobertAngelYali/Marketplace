package com.marketplace.backend.repository;

import com.marketplace.backend.dominio.SolicitudStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SolicitudStockRepository extends JpaRepository<SolicitudStock, Long> {

    List<SolicitudStock> findByEstadoOrderByFechaSolicitudDesc(SolicitudStock.EstadoSolicitudStock estado);

    List<SolicitudStock> findByUsuarioIdOrderByFechaSolicitudDesc(Long usuarioId);

    List<SolicitudStock> findAllByOrderByFechaSolicitudDesc();

    Optional<SolicitudStock> findByUsuarioIdAndProductoIdAndEstado(
            Long usuarioId,
            Long productoId,
            SolicitudStock.EstadoSolicitudStock estado
    );
}
