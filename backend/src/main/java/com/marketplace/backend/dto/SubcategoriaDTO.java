package com.marketplace.backend.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubcategoriaDTO {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("categoriaId")
    private Long categoriaId;
    
    @JsonProperty("categoriaNombre")
    private String categoriaNombre;
    
    @JsonProperty("nombre")
    private String nombre;
    
    @JsonProperty("descripcion")
    private String descripcion;
}