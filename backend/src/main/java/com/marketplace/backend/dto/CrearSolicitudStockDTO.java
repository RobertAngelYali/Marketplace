package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CrearSolicitudStockDTO {

    @NotNull(message = "El producto es obligatorio")
    @JsonProperty("productoId")
    private Long productoId;

    @NotNull(message = "La cantidad solicitada es obligatoria")
    @Min(value = 1, message = "La cantidad solicitada debe ser mayor a 0")
    @JsonProperty("cantidadSolicitada")
    private Integer cantidadSolicitada;

    @JsonProperty("mensaje")
    private String mensaje;
}
