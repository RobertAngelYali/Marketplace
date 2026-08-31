package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO para respuesta de proveedor
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProveedorDTO {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("usuarioId")
    private Long usuarioId;
    
    @JsonProperty("nombreUsuario")
    private String nombreUsuario;
    
    @JsonProperty("emailUsuario")
    private String emailUsuario;
    
    @JsonProperty("ruc")
    private String ruc;
    
    @JsonProperty("nombreEmpresa")
    private String nombreEmpresa;
    
    @JsonProperty("razonSocial")
    private String razonSocial;
    
    @JsonProperty("descripcion")
    private String descripcion;
    
    @JsonProperty("direccion")
    private String direccion;
    
    @JsonProperty("telefonoEmpresa")
    private String telefonoEmpresa;
    
    @JsonProperty("emailEmpresa")
    private String emailEmpresa;
    
    @JsonProperty("estado")
    private String estado;
    
    @JsonProperty("fechaRegistro")
    private LocalDateTime fechaRegistro;
    
    @JsonProperty("calificacionPromedio")
    private BigDecimal calificacionPromedio;
}