package com.marketplace.backend.service;
import com.marketplace.backend.dominio.Categoria;
import com.marketplace.backend.dominio.Subcategoria;
import com.marketplace.backend.dto.CategoriaDTO;
import com.marketplace.backend.dto.SubcategoriaDTO;
import com.marketplace.backend.repository.CategoriaRepository;
import com.marketplace.backend.repository.SubcategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;
    private final SubcategoriaRepository subcategoriaRepository;
    
    /**
     * Obtiene todas las categorías
     */
    @Transactional(readOnly = true)
    public List<CategoriaDTO> obtenerTodasCategorias() {
        return categoriaRepository.findAllByOrderByNombreAsc()
                .stream()
                .map(this::convertirACategoriaDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtiene todas las subcategorías
     */
    @Transactional(readOnly = true)
    public List<SubcategoriaDTO> obtenerTodasSubcategorias() {
        return subcategoriaRepository.findAllByOrderByNombreAsc()
                .stream()
                .map(this::convertirASubcategoriaDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtiene subcategorías por categoría
     */
    @Transactional(readOnly = true)
    public List<SubcategoriaDTO> obtenerSubcategoriasPorCategoria(Long categoriaId) {
        return subcategoriaRepository.findByCategoriaId(categoriaId)
                .stream()
                .map(this::convertirASubcategoriaDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Convierte Categoria a CategoriaDTO
     */
    private CategoriaDTO convertirACategoriaDTO(Categoria categoria) {
        return new CategoriaDTO(
            categoria.getId(),
            categoria.getNombre(),
            categoria.getDescripcion()
        );
    }
    
    /**
     * Convierte Subcategoria a SubcategoriaDTO
     */
    private SubcategoriaDTO convertirASubcategoriaDTO(Subcategoria subcategoria) {
        return new SubcategoriaDTO(
            subcategoria.getId(),
            subcategoria.getCategoria().getId(),
            subcategoria.getCategoria().getNombre(),
            subcategoria.getNombre(),
            subcategoria.getDescripcion()
        );
    }
}
