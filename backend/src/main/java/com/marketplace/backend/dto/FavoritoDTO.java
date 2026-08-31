package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoritoDTO {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("usuarioId")
    private Long usuarioId;

    @JsonProperty("productoId")
    private Long productoId;

    @JsonProperty("fechaAgregado")
    private LocalDateTime fechaAgregado;

    @JsonProperty("producto")
    private ProductoDTO producto;
}
