package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResenaDTO {
    @JsonProperty("id")
    private Long id;

    @JsonProperty("usuarioId")
    private Long usuarioId;

    @JsonProperty("nombreUsuario")
    private String nombreUsuario;

    @JsonProperty("productoId")
    private Long productoId;

    @JsonProperty("proveedorId")
    private Long proveedorId;

    @JsonProperty("calificacion")
    private Integer calificacion;

    @JsonProperty("comentario")
    private String comentario;

    @JsonProperty("fechaResena")
    private LocalDateTime fechaResena;
}
