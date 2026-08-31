package com.marketplace.backend.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrearPedidoDTO {
    @NotBlank(message = "La dirección de entrega es obligatoria")
    private String direccionEntrega;

    @NotBlank(message = "El teléfono de contacto es obligatorio")
    private String telefonoContacto;
    
    private String metodoPago; // Opcional, por defecto "TARJETA" o lo que definas
}
