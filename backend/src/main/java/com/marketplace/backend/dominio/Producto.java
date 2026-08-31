package com.marketplace.backend.dominio;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "proveedor_id", nullable = false)
    private Proveedor proveedor;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "subcategoria_id")
    private Subcategoria subcategoria;

    @NotEmpty(message = "El nombre del producto es obligatorio")
    @Size(max = 255)
    @Column(name = "nombre", nullable = false)
    @JsonProperty("nombre")
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    @JsonProperty("descripcion")
    private String descripcion;

    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    @JsonProperty("precioUnitario")
    private BigDecimal precioUnitario;

    @NotEmpty(message = "La unidad de medida es obligatoria")
    @Size(max = 50)
    @Column(name = "unidad_medida", nullable = false)
    @JsonProperty("unidadMedida")
    private String unidadMedida; // kg, unidad, caja, saco, bolsa, litro, etc

    @Min(value = 1, message = "La cantidad mínima debe ser al menos 1")
    @Column(name = "cantidad_minima", nullable = false)
    @JsonProperty("cantidadMinima")
    private Integer cantidadMinima = 1;

    @Min(value = 0, message = "El stock no puede ser negativo")
    @Column(name = "stock_disponible", nullable = false)
    @JsonProperty("stockDisponible")
    private Integer stockDisponible = 0;

    @Column(name = "disponible", nullable = false)
    @JsonProperty("disponible")
    private Boolean disponible = true;

    @Column(name = "fecha_publicacion", nullable = false, updatable = false)
    @JsonProperty("fechaPublicacion")
    private LocalDateTime fechaPublicacion;

    @Column(name = "calificacion_promedio", precision = 2, scale = 1)
    @JsonProperty("calificacionPromedio")
    private BigDecimal calificacionPromedio = BigDecimal.ZERO;

        public enum EstadoRevision {
        PENDIENTE,
        APROBADO,
        RECHAZADO
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_revision", nullable = false)
    @JsonProperty("estadoRevision")
    private EstadoRevision estadoRevision = EstadoRevision.PENDIENTE;

    @Column(name = "precio_oferta", precision = 10, scale = 2)
    @JsonProperty("precioOferta")
    private BigDecimal precioOferta;

    @Column(name = "destacado", nullable = false)
    @JsonProperty("destacado")
    private Boolean destacado = false;

    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    @JsonProperty("motivoRechazo")
    private String motivoRechazo;

    @Min(value = 0, message = "El stock mínimo de alerta no puede ser negativo")
    @Column(name = "stock_minimo_alerta", nullable = false)
    @JsonProperty("stockMinimoAlerta")
    private Integer stockMinimoAlerta = 10;

    @PrePersist
    protected void onCreate() {
        fechaPublicacion = LocalDateTime.now();
    }
}
