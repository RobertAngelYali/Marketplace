package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para crear un producto
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CrearProductoDTO {
    
    @NotNull(message = "El ID de categoría es obligatorio")
    @JsonProperty("categoriaId")
    private Long categoriaId;
    
    @JsonProperty("subcategoriaId")
    private Long subcategoriaId;
    
    @NotEmpty(message = "El nombre del producto es obligatorio")
    @Size(max = 255)
    @JsonProperty("nombre")
    private String nombre;
    
    @JsonProperty("descripcion")
    private String descripcion;
    
    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    @JsonProperty("precioUnitario")
    private BigDecimal precioUnitario;
    
    @NotEmpty(message = "La unidad de medida es obligatoria")
    @Size(max = 50)
    @JsonProperty("unidadMedida")
    private String unidadMedida;
    
    @NotNull(message = "La cantidad mínima es obligatoria")
    @Min(value = 1, message = "La cantidad mínima debe ser al menos 1")
    @JsonProperty("cantidadMinima")
    private Integer cantidadMinima;
    
    @NotNull(message = "El stock disponible es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    @JsonProperty("stockDisponible")
    private Integer stockDisponible;
    
    @JsonProperty("disponible")
    private Boolean disponible = true;
    
    // Lista de URLs de imágenes (opcional en la creación)
    @JsonProperty("imagenesUrls")
    private List<String> imagenesUrls;

    @JsonProperty("precioOferta")
    private BigDecimal precioOferta;

    @JsonProperty("stockMinimoAlerta")
    @Min(value = 0, message = "El stock mínimo de alerta no puede ser negativo")
    private Integer stockMinimoAlerta = 10;
}