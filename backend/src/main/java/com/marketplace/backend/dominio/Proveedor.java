package com.marketplace.backend.dominio;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "proveedores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Proveedor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @NotEmpty(message = "El RUC es obligatorio")
    @Size(min = 11, max = 11, message = "El RUC debe tener 11 dígitos")
    @Column(name = "ruc", unique = true, nullable = false, length = 11)
    @JsonProperty("ruc")
    private String ruc;

    @NotEmpty(message = "El nombre de empresa es obligatorio")
    @Size(max = 255)
    @Column(name = "nombre_empresa", nullable = false)
    @JsonProperty("nombreEmpresa")
    private String nombreEmpresa;

    @Size(max = 255)
    @Column(name = "razon_social")
    @JsonProperty("razonSocial")
    private String razonSocial;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    @JsonProperty("descripcion")
    private String descripcion;

    @Size(max = 255)
    @Column(name = "direccion")
    @JsonProperty("direccion")
    private String direccion;

    @Size(max = 20)
    @Column(name = "telefono_empresa")
    @JsonProperty("telefonoEmpresa")
    private String telefonoEmpresa;

    @Size(max = 255)
    @Column(name = "email_empresa")
    @JsonProperty("emailEmpresa")
    private String emailEmpresa;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, columnDefinition = "ENUM('pendiente','aprobado','suspendido','rechazado') DEFAULT 'pendiente'")
    @JsonProperty("estado")
    private EstadoProveedor estado = EstadoProveedor.PENDIENTE;

    @Column(name = "fecha_registro", nullable = false, updatable = false)
    @JsonProperty("fechaRegistro")
    private LocalDateTime fechaRegistro;

    @Column(name = "calificacion_promedio", precision = 2, scale = 1)
    @JsonProperty("calificacionPromedio")
    private BigDecimal calificacionPromedio = BigDecimal.ZERO;

    @PrePersist
    protected void onCreate() {
        fechaRegistro = LocalDateTime.now();
    }

    // Enum para el estado del proveedor
    public enum EstadoProveedor {
        PENDIENTE,
        APROBADO,
        SUSPENDIDO,
        RECHAZADO
    }
}
