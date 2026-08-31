package com.marketplace.backend.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.marketplace.backend.dominio.Usuario.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    @JsonProperty("token")
    private String token;
    
    @JsonProperty("usuario")
    private UsuarioInfo usuario;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsuarioInfo {
        @JsonProperty("id")
        private Long id;
        
        @JsonProperty("email")
        private String email;
        
        @JsonProperty("nombre")
        private String nombre;
        
        @JsonProperty("apellido")
        private String apellido;
        
        @JsonProperty("rol")
        private RolUsuario rol;
    }
}
