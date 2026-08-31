package com.marketplace.backend.repository;

import com.marketplace.backend.dominio.Subcategoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubcategoriaRepository extends JpaRepository<Subcategoria, Long> {

    // Buscar subcategorías por categoría
    List<Subcategoria> findByCategoriaId(Long categoriaId);

    // Listar todas ordenadas por nombre
    List<Subcategoria> findAllByOrderByNombreAsc();

    // Buscar subcategorías por nombre de categoría
    List<Subcategoria> findByCategoriaNombre(String nombreCategoria);
}