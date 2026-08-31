package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para respuesta de producto con sus imágenes
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoDTO {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("proveedorId")
    private Long proveedorId;
    
    @JsonProperty("nombreEmpresa")
    private String nombreEmpresa;
    
    @JsonProperty("categoriaId")
    private Long categoriaId;
    
    @JsonProperty("categoriaNombre")
    private String categoriaNombre;
    
    @JsonProperty("subcategoriaId")
    private Long subcategoriaId;
    
    @JsonProperty("subcategoriaNombre")
    private String subcategoriaNombre;
    
    @JsonProperty("nombre")
    private String nombre;
    
    @JsonProperty("descripcion")
    private String descripcion;
    
    @JsonProperty("precioUnitario")
    private BigDecimal precioUnitario;
    
    @JsonProperty("unidadMedida")
    private String unidadMedida;
    
    @JsonProperty("cantidadMinima")
    private Integer cantidadMinima;
    
    @JsonProperty("stockDisponible")
    private Integer stockDisponible;
    
    @JsonProperty("disponible")
    private Boolean disponible;
    
    @JsonProperty("fechaPublicacion")
    private LocalDateTime fechaPublicacion;
    
    @JsonProperty("calificacionPromedio")
    private BigDecimal calificacionPromedio;
    
    @JsonProperty("imagenes")
    private List<ImagenProductoDTO> imagenes;

    @JsonProperty("estadoRevision")
    private String estadoRevision;

    @JsonProperty("precioOferta")
    private BigDecimal precioOferta;

    @JsonProperty("destacado")
    private Boolean destacado;

    @JsonProperty("motivoRechazo")
    private String motivoRechazo;

    @JsonProperty("stockMinimoAlerta")
    private Integer stockMinimoAlerta;

    @JsonProperty("stockBajo")
    private Boolean stockBajo;

    @JsonProperty("agotado")
    private Boolean agotado;

    @JsonProperty("estadoInventario")
    private String estadoInventario;

    /**
     * Campo calculado para el enlace directo del producto.
     * Jackson lo incluirá automáticamente en el JSON como "urlProducto"
     */
    @JsonProperty("urlProducto")
    public String getUrlProducto() {
        if (this.id == null) return null;
        // Ajusta esta URL base si en el futuro cambia tu dominio
        return "https://innovacion-snowy.vercel.app/vista_producto?id=" + this.id;
    }
}