package com.marketplace.backend.dominio;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "resenas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resena {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "proveedor_id", nullable = false)
    private Proveedor proveedor;

    @Min(value = 1, message = "La calificación mínima es 1")
    @Max(value = 5, message = "La calificación máxima es 5")
    @Column(name = "calificacion", nullable = false)
    @JsonProperty("calificacion")
    private Integer calificacion;

    @Column(name = "comentario", columnDefinition = "TEXT")
    @JsonProperty("comentario")
    private String comentario;

    @Column(name = "fecha_resena", nullable = false, updatable = false)
    @JsonProperty("fechaResena")
    private LocalDateTime fechaResena;

    @PrePersist
    protected void onCreate() {
        fechaResena = LocalDateTime.now();
    }
}
