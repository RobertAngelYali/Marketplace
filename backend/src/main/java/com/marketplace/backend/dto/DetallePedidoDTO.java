package com.marketplace.backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DetallePedidoDTO {
    private Long id;
    private String nombreProducto;
    private String imagenUrl;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
    private String nombreProveedor;
    private Long proveedorId;
}