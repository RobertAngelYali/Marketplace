package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para crear solicitud de proveedor
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudProveedorDTO {
    
    @NotEmpty(message = "El RUC es obligatorio")
    @Size(min = 11, max = 11, message = "El RUC debe tener 11 dígitos")
    @JsonProperty("ruc")
    private String ruc;
    
    @NotEmpty(message = "El nombre de empresa es obligatorio")
    @Size(max = 255)
    @JsonProperty("nombreEmpresa")
    private String nombreEmpresa;
    
    @Size(max = 255)
    @JsonProperty("razonSocial")
    private String razonSocial;
    
    @JsonProperty("descripcion")
    private String descripcion;
    
    @Size(max = 255)
    @JsonProperty("direccion")
    private String direccion;
    
    @Size(max = 20)
    @JsonProperty("telefonoEmpresa")
    private String telefonoEmpresa;
    
    @Email(message = "Email inválido")
    @Size(max = 255)
    @JsonProperty("emailEmpresa")
    private String emailEmpresa;
}