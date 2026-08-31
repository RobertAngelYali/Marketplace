package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CambiarEstadoSolicitudStockDTO {

    @NotEmpty(message = "El estado es obligatorio")
    @JsonProperty("estado")
    private String estado;

    @JsonProperty("respuestaAdmin")
    private String respuestaAdmin;
}
