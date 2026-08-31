package com.marketplace.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PedidoDetalleCompletoDTO {
    private Long id;
    private String numeroPedido;
    private LocalDateTime fechaPedido;
    private String estado;
    private BigDecimal total;
    private String direccionEntrega;
    private String telefonoContacto;
    private String metodoPago;
    private List<DetallePedidoDTO> productos;
}
