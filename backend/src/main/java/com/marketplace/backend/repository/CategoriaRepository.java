package com.marketplace.backend.repository;

import com.marketplace.backend.dominio.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    // Buscar categoría por nombre
    Optional<Categoria> findByNombre(String nombre);

    // Listar todas ordenadas por nombre
    List<Categoria> findAllByOrderByNombreAsc();

    // Verificar si existe una categoría por nombre
    boolean existsByNombre(String nombre);
}
