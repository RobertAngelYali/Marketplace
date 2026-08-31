package com.marketplace.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudStockDTO {

    @JsonProperty("id")
    private Long id;

    @JsonProperty("productoId")
    private Long productoId;

    @JsonProperty("nombreProducto")
    private String nombreProducto;

    @JsonProperty("unidadMedida")
    private String unidadMedida;

    @JsonProperty("proveedorId")
    private Long proveedorId;

    @JsonProperty("nombreEmpresa")
    private String nombreEmpresa;

    @JsonProperty("usuarioId")
    private Long usuarioId;

    @JsonProperty("nombreUsuario")
    private String nombreUsuario;

    @JsonProperty("emailUsuario")
    private String emailUsuario;

    @JsonProperty("telefonoUsuario")
    private String telefonoUsuario;

    @JsonProperty("cantidadSolicitada")
    private Integer cantidadSolicitada;

    @JsonProperty("stockActual")
    private Integer stockActual;

    @JsonProperty("mensaje")
    private String mensaje;

    @JsonProperty("estado")
    private String estado;

    @JsonProperty("respuestaAdmin")
    private String respuestaAdmin;

    @JsonProperty("fechaSolicitud")
    private LocalDateTime fechaSolicitud;

    @JsonProperty("fechaActualizacion")
    private LocalDateTime fechaActualizacion;
}
