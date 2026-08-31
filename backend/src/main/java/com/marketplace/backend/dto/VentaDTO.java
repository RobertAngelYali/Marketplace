package com.marketplace.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VentaDTO {
    private Long id; // ID del detalle
    private String numeroPedido;
    private LocalDateTime fechaVenta;
    private String nombreProducto;
    private String imagenUrl; // Para mostrar la foto chiquita como la de carlinnho
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal; // Cuánto ganó en esta venta
    private String estadoPedido;
    private String clienteNombre; // Nombre del comprador
}