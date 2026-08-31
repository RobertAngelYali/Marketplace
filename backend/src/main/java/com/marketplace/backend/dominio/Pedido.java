package com.marketplace.backend.dominio;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @NotEmpty(message = "El número de pedido es obligatorio")
    @Size(max = 50)
    @Column(name = "numero_pedido", unique = true, nullable = false, length = 50)
    @JsonProperty("numeroPedido")
    private String numeroPedido;

    @DecimalMin(value = "0.01", message = "El total debe ser mayor a 0")
    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    @JsonProperty("total")
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, columnDefinition = "ENUM('pendiente','confirmado','en_preparacion','enviado','entregado','cancelado') DEFAULT 'pendiente'")
    @JsonProperty("estado")
    private EstadoPedido estado = EstadoPedido.pendiente;

    @NotEmpty(message = "La dirección de entrega es obligatoria")
    @Column(name = "direccion_entrega", nullable = false, columnDefinition = "TEXT")
    @JsonProperty("direccionEntrega")
    private String direccionEntrega;

    @NotEmpty(message = "El teléfono de contacto es obligatorio")
    @Size(max = 20)
    @Column(name = "telefono_contacto", nullable = false)
    @JsonProperty("telefonoContacto")
    private String telefonoContacto;

    @Column(name = "fecha_pedido", nullable = false, updatable = false)
    @JsonProperty("fechaPedido")
    private LocalDateTime fechaPedido;

    @Size(max = 50)
    @Column(name = "metodo_pago")
    @JsonProperty("metodoPago")
    private String metodoPago;

    @PrePersist
    protected void onCreate() {
        fechaPedido = LocalDateTime.now();
    }

    // Enum para el estado del pedido
    public enum EstadoPedido {
        pendiente,
        confirmado,
        en_preparacion,
        enviado,
        entregado,
        cancelado
    }
}
