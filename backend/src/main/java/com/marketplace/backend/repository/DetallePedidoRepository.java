package com.marketplace.backend.repository;

import com.marketplace.backend.dominio.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Long> {
    
    // Spring Data JPA es inteligente: navega de DetallePedido -> Pedido -> FechaPedido
    List<DetallePedido> findByProveedorIdOrderByPedidoFechaPedidoDesc(Long proveedorId);
    
    // ⭐ NUEVO: Método optimizado para obtener detalles con producto y proveedor
    @Query("SELECT d FROM DetallePedido d " +
           "LEFT JOIN FETCH d.producto p " +
           "LEFT JOIN FETCH d.proveedor pr " +
           "WHERE d.pedido.id = :pedidoId")
    List<DetallePedido> findByPedidoIdWithProductoAndProveedor(@Param("pedidoId") Long pedidoId);
}