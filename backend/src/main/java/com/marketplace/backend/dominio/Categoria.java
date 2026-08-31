package com.marketplace.backend.dominio;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "categorias")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long id;

    @NotEmpty(message = "El nombre de la categoría es obligatorio")
    @Size(max = 100)
    @Column(name = "nombre", unique = true, nullable = false, length = 100)
    @JsonProperty("nombre")
    private String nombre;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    @JsonProperty("descripcion")
    private String descripcion;
}
