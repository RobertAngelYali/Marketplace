package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para actualizar un producto
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarProductoDTO {
    
    @JsonProperty("categoriaId")
    private Long categoriaId;
    
    @JsonProperty("subcategoriaId")
    private Long subcategoriaId;
    
    @Size(max = 255)
    @JsonProperty("nombre")
    private String nombre;
    
    @JsonProperty("descripcion")
    private String descripcion;
    
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    @JsonProperty("precioUnitario")
    private BigDecimal precioUnitario;
    
    @Size(max = 50)
    @JsonProperty("unidadMedida")
    private String unidadMedida;
    
    @Min(value = 1, message = "La cantidad mínima debe ser al menos 1")
    @JsonProperty("cantidadMinima")
    private Integer cantidadMinima;
    
    @Min(value = 0, message = "El stock no puede ser negativo")
    @JsonProperty("stockDisponible")
    private Integer stockDisponible;
    
    @JsonProperty("disponible")
    private Boolean disponible;

    @JsonProperty("precioOferta")
    @DecimalMin(value = "0.01", message = "El precio de oferta debe ser mayor a 0")
    private BigDecimal precioOferta;

    @JsonProperty("stockMinimoAlerta")
    @Min(value = 0, message = "El stock mínimo de alerta no puede ser negativo")
    private Integer stockMinimoAlerta;
}