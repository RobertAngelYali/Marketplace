package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para el resumen completo del carrito
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarritoResumenDTO {
    @JsonProperty("items")
    private List<CarritoItemDTO> items;

    @JsonProperty("cantidadTotal")
    private Integer cantidadTotal; // Total de items diferentes

    @JsonProperty("cantidadProductos")
    private Integer cantidadProductos; // Suma de todas las cantidades

    @JsonProperty("subtotal")
    private BigDecimal subtotal; // Suma de todos los subtotales

    @JsonProperty("totalProveedores")
    private Integer totalProveedores; // Cantidad de proveedores distintos
}
