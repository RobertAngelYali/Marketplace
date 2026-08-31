package com.marketplace.backend.service;

import com.marketplace.backend.dominio.*;
import com.marketplace.backend.dto.*;
import com.marketplace.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final ImagenProductoRepository imagenProductoRepository;

    @Transactional(readOnly = true)
    public List<FavoritoDTO> obtenerMisFavoritos(Long usuarioId) {
        return favoritoRepository.findByUsuarioIdOrderByFechaAgregadoDesc(usuarioId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Long> obtenerIdsFavoritos(Long usuarioId) {
        return favoritoRepository.findByUsuarioIdOrderByFechaAgregadoDesc(usuarioId)
                .stream()
                .map(favorito -> favorito.getProducto().getId())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean esFavorito(Long usuarioId, Long productoId) {
        return favoritoRepository.existsByUsuarioIdAndProductoId(usuarioId, productoId);
    }

    @Transactional
    public FavoritoDTO agregarFavorito(Long usuarioId, Long productoId) {
        if (favoritoRepository.existsByUsuarioIdAndProductoId(usuarioId, productoId)) {
            return favoritoRepository.findByUsuarioIdAndProductoId(usuarioId, productoId)
                    .map(this::convertirADTO)
                    .orElseThrow(() -> new RuntimeException("No se pudo obtener el favorito"));
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (producto.getEstadoRevision() != Producto.EstadoRevision.APROBADO || !Boolean.TRUE.equals(producto.getDisponible())) {
            throw new RuntimeException("Solo puedes agregar productos publicados a favoritos");
        }

        Favorito favorito = new Favorito();
        favorito.setUsuario(usuario);
        favorito.setProducto(producto);

        Favorito guardado = favoritoRepository.save(favorito);
        log.info("Usuario {} agregó producto {} a favoritos", usuarioId, productoId);
        return convertirADTO(guardado);
    }

    @Transactional
    public void eliminarFavorito(Long usuarioId, Long productoId) {
        Favorito favorito = favoritoRepository.findByUsuarioIdAndProductoId(usuarioId, productoId)
                .orElseThrow(() -> new RuntimeException("El producto no está en favoritos"));

        favoritoRepository.delete(favorito);
        log.info("Usuario {} eliminó producto {} de favoritos", usuarioId, productoId);
    }

    @Transactional
    public Map<String, Object> alternarFavorito(Long usuarioId, Long productoId) {
        Map<String, Object> resultado = new HashMap<>();

        if (favoritoRepository.existsByUsuarioIdAndProductoId(usuarioId, productoId)) {
            eliminarFavorito(usuarioId, productoId);
            resultado.put("favorito", false);
            resultado.put("productoId", productoId);
            resultado.put("message", "Producto eliminado de favoritos");
            return resultado;
        }

        FavoritoDTO favorito = agregarFavorito(usuarioId, productoId);
        resultado.put("favorito", true);
        resultado.put("productoId", productoId);
        resultado.put("favoritoId", favorito.getId());
        resultado.put("message", "Producto agregado a favoritos");
        return resultado;
    }

    private FavoritoDTO convertirADTO(Favorito favorito) {
        FavoritoDTO dto = new FavoritoDTO();
        dto.setId(favorito.getId());
        dto.setUsuarioId(favorito.getUsuario().getId());
        dto.setProductoId(favorito.getProducto().getId());
        dto.setFechaAgregado(favorito.getFechaAgregado());
        dto.setProducto(convertirProductoADTO(favorito.getProducto()));
        return dto;
    }

    private ProductoDTO convertirProductoADTO(Producto producto) {
        ProductoDTO dto = new ProductoDTO();
        dto.setId(producto.getId());
        dto.setProveedorId(producto.getProveedor().getId());
        dto.setNombreEmpresa(producto.getProveedor().getNombreEmpresa());
        dto.setCategoriaId(producto.getCategoria().getId());
        dto.setCategoriaNombre(producto.getCategoria().getNombre());

        if (producto.getSubcategoria() != null) {
            dto.setSubcategoriaId(producto.getSubcategoria().getId());
            dto.setSubcategoriaNombre(producto.getSubcategoria().getNombre());
        }

        dto.setNombre(producto.getNombre());
        dto.setDescripcion(producto.getDescripcion());
        dto.setPrecioUnitario(producto.getPrecioUnitario());
        dto.setPrecioOferta(producto.getPrecioOferta());
        dto.setUnidadMedida(producto.getUnidadMedida());
        dto.setCantidadMinima(producto.getCantidadMinima());
        dto.setStockDisponible(producto.getStockDisponible());
        dto.setStockMinimoAlerta(producto.getStockMinimoAlerta());
        dto.setDisponible(producto.getDisponible());
        dto.setEstadoRevision(producto.getEstadoRevision() != null ? producto.getEstadoRevision().name() : "PENDIENTE");
        dto.setDestacado(producto.getDestacado());
        dto.setMotivoRechazo(producto.getMotivoRechazo());
        dto.setFechaPublicacion(producto.getFechaPublicacion());
        dto.setCalificacionPromedio(producto.getCalificacionPromedio());

        boolean agotado = producto.getStockDisponible() != null && producto.getStockDisponible() == 0;
        boolean stockBajo = producto.getStockDisponible() != null
                && producto.getStockMinimoAlerta() != null
                && producto.getStockDisponible() <= producto.getStockMinimoAlerta()
                && producto.getStockDisponible() > 0;

        dto.setAgotado(agotado);
        dto.setStockBajo(stockBajo);
        dto.setEstadoInventario(agotado ? "AGOTADO" : stockBajo ? "STOCK_BAJO" : "DISPONIBLE");

        List<ImagenProductoDTO> imagenes = imagenProductoRepository.findByProductoId(producto.getId())
                .stream()
                .map(this::convertirAImagenDTO)
                .collect(Collectors.toList());
        dto.setImagenes(imagenes);
        return dto;
    }

    private ImagenProductoDTO convertirAImagenDTO(ImagenProducto imagen) {
        ImagenProductoDTO dto = new ImagenProductoDTO();
        dto.setId(imagen.getId());
        dto.setProductoId(imagen.getProducto().getId());
        dto.setUrlImagen(imagen.getUrlImagen());
        return dto;
    }
}
