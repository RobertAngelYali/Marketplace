package com.marketplace.backend.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.marketplace.backend.dominio.Usuario.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDTO {
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("nombre")
    private String nombre;
    
    @JsonProperty("apellido")
    private String apellido;
    
    @JsonProperty("telefono")
    private String telefono;
    
    @JsonProperty("rol")
    private RolUsuario rol;
    
    @JsonProperty("fechaRegistro")
    private LocalDateTime fechaRegistro;

    public UsuarioResponseDTO(com.marketplace.backend.dominio.Usuario usuario) {
        this.id = usuario.getId();
        this.email = usuario.getEmail();
        this.nombre = usuario.getNombre();
        this.apellido = usuario.getApellido();
        this.telefono = usuario.getTelefono();
        this.rol = usuario.getRol();
        this.fechaRegistro = usuario.getFechaRegistro();
    }
}
