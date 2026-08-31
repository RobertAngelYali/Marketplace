package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para imágenes de producto
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImagenProductoDTO {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("productoId")
    private Long productoId;
    
    @NotEmpty(message = "La URL de la imagen es obligatoria")
    @JsonProperty("urlImagen")
    private String urlImagen;
}