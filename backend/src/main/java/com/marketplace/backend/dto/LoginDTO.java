package com.marketplace.backend.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class LoginDTO {
        @NotEmpty(message = "El email es obligatorio")
    @Email(message = "Email inválido")
    private String email;
    
    @NotEmpty(message = "La contraseña es obligatoria")
    private String password;
}
