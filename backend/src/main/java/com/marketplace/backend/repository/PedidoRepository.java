package com.marketplace.backend.repository;

import com.marketplace.backend.dominio.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioIdOrderByFechaPedidoDesc(Long usuarioId);
    boolean existsByNumeroPedido(String numeroPedido);
    
    // ⭐ NUEVO: Buscar pedido validando que pertenece al usuario
    @Query("SELECT p FROM Pedido p WHERE p.id = :pedidoId AND p.usuario.id = :usuarioId")
    Optional<Pedido> findByIdAndUsuarioId(@Param("pedidoId") Long pedidoId, @Param("usuarioId") Long usuarioId);
}