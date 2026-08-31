package com.marketplace.backend.dominio;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "usuarios")
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long id;

    @NotEmpty(message = "El email es obligatorio")
    @Email(message = "Email inválido")
    @Size(max = 255)
    @Column(name = "email", unique = true, nullable = false)
    @JsonProperty("email")
    private String email;

    @NotEmpty(message = "La contraseña es obligatoria")
    @Size(max = 255)
    @Column(name = "password", nullable = false)
    @JsonProperty("password")
    private String password;

    @NotEmpty(message = "El nombre es obligatorio")
    @Size(max = 100)
    @Column(name = "nombre", nullable = false)
    @JsonProperty("nombre")
    private String nombre;

    @NotEmpty(message = "El apellido es obligatorio")
    @Size(max = 100)
    @Column(name = "apellido", nullable = false)
    @JsonProperty("apellido")
    private String apellido;

    @Size(max = 20)
    @Column(name = "telefono")
    @JsonProperty("telefono")
    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false, columnDefinition = "ENUM('invitado','usuario','proveedor','administrador') DEFAULT 'usuario'")
    @JsonProperty("rol")
    private RolUsuario rol = RolUsuario.usuario;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    @JsonProperty("fechaRegistro")
    private LocalDateTime fechaRegistro;

    @PrePersist
    protected void onCreate() {
        fechaRegistro = LocalDateTime.now();
    }

    // Enum para los roles
    public enum RolUsuario {
        invitado,
        usuario,
        proveedor,
        administrador
    }
}
