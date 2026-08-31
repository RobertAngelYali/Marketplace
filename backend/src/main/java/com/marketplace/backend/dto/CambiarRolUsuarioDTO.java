package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.marketplace.backend.dominio.Usuario.RolUsuario;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para cambiar rol de usuario (admin)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CambiarRolUsuarioDTO {
    
    @NotNull(message = "El rol es obligatorio")
    @JsonProperty("rol")
    private RolUsuario rol;
}