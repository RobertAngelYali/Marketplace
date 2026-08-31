package com.marketplace.backend.dominio;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes_stock")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Min(value = 1, message = "La cantidad solicitada debe ser mayor a 0")
    @Column(name = "cantidad_solicitada", nullable = false)
    @JsonProperty("cantidadSolicitada")
    private Integer cantidadSolicitada;

    @Column(name = "stock_actual", nullable = false)
    @JsonProperty("stockActual")
    private Integer stockActual;

    @Column(name = "mensaje", columnDefinition = "TEXT")
    @JsonProperty("mensaje")
    private String mensaje;

    public enum EstadoSolicitudStock {
        PENDIENTE,
        EN_REVISION,
        ATENDIDA,
        RECHAZADA
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    @JsonProperty("estado")
    private EstadoSolicitudStock estado = EstadoSolicitudStock.PENDIENTE;

    @Column(name = "respuesta_admin", columnDefinition = "TEXT")
    @JsonProperty("respuestaAdmin")
    private String respuestaAdmin;

    @Column(name = "fecha_solicitud", nullable = false, updatable = false)
    @JsonProperty("fechaSolicitud")
    private LocalDateTime fechaSolicitud;

    @Column(name = "fecha_actualizacion")
    @JsonProperty("fechaActualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    protected void onCreate() {
        fechaSolicitud = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
