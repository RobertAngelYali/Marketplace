package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para cambiar estado de producto
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CambiarEstadoProductoDTO {
    @NotBlank(message = "El estado es obligatorio")
    @JsonProperty("estadoRevision")
    private String estadoRevision;

    @JsonProperty("motivoRechazo")
    private String motivoRechazo;
}
