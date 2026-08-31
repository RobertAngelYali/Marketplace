package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CrearResenaDTO {
    @Min(value = 1, message = "La calificación mínima es 1")
    @Max(value = 5, message = "La calificación máxima es 5")
    @JsonProperty("calificacion")
    private Integer calificacion;

    @NotBlank(message = "El comentario es obligatorio")
    @Size(min = 3, max = 500, message = "El comentario debe tener entre 3 y 500 caracteres")
    @JsonProperty("comentario")
    private String comentario;
}
