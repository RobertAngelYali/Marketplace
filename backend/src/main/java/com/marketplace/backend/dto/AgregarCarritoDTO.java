package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para agregar productos al carrito
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgregarCarritoDTO {
    
    @NotNull(message = "El ID del producto es obligatorio")
    @JsonProperty("productoId")
    private Long productoId;
    
    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    @JsonProperty("cantidad")
    private Integer cantidad;
}