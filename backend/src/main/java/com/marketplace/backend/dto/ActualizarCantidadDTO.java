package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar la cantidad de un producto en el carrito
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarCantidadDTO {
    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    @JsonProperty("cantidad")
    private Integer cantidad;
}
