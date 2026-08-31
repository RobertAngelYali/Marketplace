package com.marketplace.backend.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO para un item individual del carrito con información del producto
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarritoItemDTO {
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("productoId")
    private Long productoId;
    
    @JsonProperty("nombreProducto")
    private String nombreProducto;
    
    @JsonProperty("descripcionProducto")
    private String descripcionProducto;
    
    @JsonProperty("precioUnitario")
    private BigDecimal precioUnitario;
    
    @JsonProperty("unidadMedida")
    private String unidadMedida;
    
    @JsonProperty("cantidad")
    private Integer cantidad;
    
    @JsonProperty("cantidadMinima")
    private Integer cantidadMinima;
    
    @JsonProperty("stockDisponible")
    private Integer stockDisponible;
    
    @JsonProperty("subtotal")
    private BigDecimal subtotal;
    
    @JsonProperty("proveedorId")
    private Long proveedorId;
    
    @JsonProperty("nombreEmpresa")
    private String nombreEmpresa;
    
    @JsonProperty("imagenUrl")
    private String imagenUrl; // Primera imagen del producto
    
    @JsonProperty("disponible")
    private Boolean disponible;
    
    @JsonProperty("fechaAgregado")
    private LocalDateTime fechaAgregado;
}
