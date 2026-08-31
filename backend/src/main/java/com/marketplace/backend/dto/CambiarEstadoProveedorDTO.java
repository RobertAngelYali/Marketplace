package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para cambiar estado de proveedor
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CambiarEstadoProveedorDTO {
    
    @NotEmpty(message = "El estado es obligatorio")
    @JsonProperty("estado")
    private String estado; // PENDIENTE, APROBADO, SUSPENDIDO, RECHAZADO
}