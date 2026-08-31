package com.marketplace.backend.service;

import com.marketplace.backend.dominio.*;
import com.marketplace.backend.dto.*;
import com.marketplace.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductoService {
    
    private final ProductoRepository productoRepository;
    private final ImagenProductoRepository imagenProductoRepository;
    private final ProveedorRepository proveedorRepository;
    private final CategoriaRepository categoriaRepository;
    private final SubcategoriaRepository subcategoriaRepository;
    
    /**
     * Crear producto (solo proveedor)
     */
    @Transactional
    public ProductoDTO crearProducto(Long usuarioId, CrearProductoDTO dto) {
        log.info("Creando producto para usuario: {}", usuarioId);
        
        // Verificar que el usuario sea proveedor aprobado
        Proveedor proveedor = proveedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("No eres un proveedor"));
        
        if (proveedor.getEstado() != Proveedor.EstadoProveedor.APROBADO) {
            throw new RuntimeException("Tu cuenta de proveedor no está aprobada");
        }
        
        // Validar categoría
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        
        // Validar subcategoría si existe
        Subcategoria subcategoria = null;
        if (dto.getSubcategoriaId() != null) {
            subcategoria = subcategoriaRepository.findById(dto.getSubcategoriaId())
                    .orElseThrow(() -> new RuntimeException("Subcategoría no encontrada"));
        }
        
        // Crear producto
        Producto producto = new Producto();
        producto.setProveedor(proveedor);
        producto.setCategoria(categoria);
        producto.setSubcategoria(subcategoria);
        producto.setNombre(dto.getNombre());
        producto.setDescripcion(dto.getDescripcion());

        producto.setPrecioUnitario(dto.getPrecioUnitario());
        producto.setPrecioOferta(dto.getPrecioOferta());
        producto.setUnidadMedida(dto.getUnidadMedida());
        producto.setCantidadMinima(dto.getCantidadMinima());
        producto.setStockDisponible(dto.getStockDisponible());
        producto.setStockMinimoAlerta(
                dto.getStockMinimoAlerta() != null ? dto.getStockMinimoAlerta() : 10
        );

        // Nuevo flujo ecommerce:
        // el proveedor crea, pero el admin aprueba antes de publicar.
        producto.setEstadoRevision(Producto.EstadoRevision.PENDIENTE);
        producto.setMotivoRechazo(null);
        producto.setDestacado(false);

        // Puede estar disponible internamente, pero NO aparecerá en catálogo hasta ser APROBADO.
        producto.setDisponible(dto.getDisponible() != null ? dto.getDisponible() : true);
        

        Producto productoGuardado = productoRepository.save(producto);
        log.info("Producto creado con ID: {}", productoGuardado.getId());
        
        // Guardar imágenes si existen
        if (dto.getImagenesUrls() != null && !dto.getImagenesUrls().isEmpty()) {
            for (String url : dto.getImagenesUrls()) {
                ImagenProducto imagen = new ImagenProducto();
                imagen.setProducto(productoGuardado);
                imagen.setUrlImagen(url);
                imagenProductoRepository.save(imagen);
            }
            log.info("Se guardaron {} imágenes para el producto", dto.getImagenesUrls().size());
        }
        
        return convertirADTO(productoGuardado);
    }
    
    /**
     * Obtener mis productos (proveedor)
     */
    @Transactional(readOnly = true)
    public List<ProductoDTO> obtenerMisProductos(Long usuarioId) {
        log.info("Obteniendo productos del usuario: {}", usuarioId);
        
        Proveedor proveedor = proveedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("No eres un proveedor"));
        
        List<Producto> productos = productoRepository.findByProveedorId(proveedor.getId());
        return convertirListaADTO(productos);
    }
    
    /**
     * Obtener producto específico del proveedor
     */
    @Transactional(readOnly = true)
    public ProductoDTO obtenerMiProducto(Long usuarioId, Long productoId) {
        log.info("Obteniendo producto {} del usuario {}", productoId, usuarioId);
        
        Proveedor proveedor = proveedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("No eres un proveedor"));
        
        Producto producto = productoRepository.findByIdAndProveedorId(productoId, proveedor.getId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado o no te pertenece"));
        
        return convertirADTO(producto);
    }
    
    /**
     * Actualizar producto (proveedor)
     */
    @Transactional
    public ProductoDTO actualizarProducto(Long usuarioId,Long productoId, ActualizarProductoDTO dto) {
        log.info("Actualizando producto {} del usuario {}", productoId, usuarioId);
        
        Proveedor proveedor = proveedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("No eres un proveedor"));
        
        Producto producto = productoRepository.findByIdAndProveedorId(productoId, proveedor.getId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado o no te pertenece"));
        
        // Actualizar campos si no son null
        if (dto.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            producto.setCategoria(categoria);
        }
        
        if (dto.getSubcategoriaId() != null) {
            Subcategoria subcategoria = subcategoriaRepository.findById(dto.getSubcategoriaId())
                    .orElseThrow(() -> new RuntimeException("Subcategoría no encontrada"));
            producto.setSubcategoria(subcategoria);
        }
        
        if (dto.getNombre() != null) producto.setNombre(dto.getNombre());
        if (dto.getDescripcion() != null) producto.setDescripcion(dto.getDescripcion());

        if (dto.getPrecioUnitario() != null) producto.setPrecioUnitario(dto.getPrecioUnitario());
        if (dto.getPrecioOferta() != null) producto.setPrecioOferta(dto.getPrecioOferta());
        if (dto.getUnidadMedida() != null) producto.setUnidadMedida(dto.getUnidadMedida());
        if (dto.getCantidadMinima() != null) producto.setCantidadMinima(dto.getCantidadMinima());
        if (dto.getStockDisponible() != null) producto.setStockDisponible(dto.getStockDisponible());
        if (dto.getStockMinimoAlerta() != null) producto.setStockMinimoAlerta(dto.getStockMinimoAlerta());

        if (dto.getDisponible() != null) producto.setDisponible(dto.getDisponible());

        // Si el proveedor edita un producto, vuelve a revisión.
        producto.setEstadoRevision(Producto.EstadoRevision.PENDIENTE);
        producto.setMotivoRechazo(null);
        
        Producto actualizado = productoRepository.save(producto);
        log.info("Producto {} actualizado exitosamente", productoId);
        
        return convertirADTO(actualizado);
    }
    
    /**
     * Eliminar producto (proveedor)
     */
    @Transactional
    public void eliminarProducto(Long usuarioId, Long productoId) {
        log.info("Eliminando producto {} del usuario {}", productoId, usuarioId);
        
        Proveedor proveedor = proveedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("No eres un proveedor"));
        
        Producto producto = productoRepository.findByIdAndProveedorId(productoId, proveedor.getId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado o no te pertenece"));
        
        // Eliminar imágenes primero
        imagenProductoRepository.deleteByProductoId(productoId);
        
        // Eliminar producto
        productoRepository.delete(producto);
        
        log.info("Producto {} eliminado exitosamente", productoId);
    }
    
    /**
     * Agregar imagen a producto
     */
    @Transactional
    public ImagenProductoDTO agregarImagen(Long usuarioId, Long productoId, String urlImagen) {
        log.info("Agregando imagen al producto {} del usuario {}", productoId, usuarioId);
        
        Proveedor proveedor = proveedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("No eres un proveedor"));
        
        Producto producto = productoRepository.findByIdAndProveedorId(productoId, proveedor.getId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado o no te pertenece"));
        
        ImagenProducto imagen = new ImagenProducto();
        imagen.setProducto(producto);
        imagen.setUrlImagen(urlImagen);
        
        ImagenProducto guardada = imagenProductoRepository.save(imagen);
        log.info("Imagen agregada con ID: {}", guardada.getId());
        
        return convertirAImagenDTO(guardada);
    }
    
    /**
     * Eliminar imagen de producto
     */
    @Transactional
    public void eliminarImagen(Long usuarioId, Long productoId, Long imagenId) {
        log.info("Eliminando imagen {} del producto {} del usuario {}", imagenId, productoId, usuarioId);
        
        Proveedor proveedor = proveedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("No eres un proveedor"));
        
        // Verificar que el producto pertenece al proveedor
        productoRepository.findByIdAndProveedorId(productoId, proveedor.getId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado o no te pertenece"));
        
        // Buscar y eliminar imagen
        ImagenProducto imagen = imagenProductoRepository.findById(imagenId)
                .orElseThrow(() -> new RuntimeException("Imagen no encontrada"));
        
        if (!imagen.getProducto().getId().equals(productoId)) {
            throw new RuntimeException("La imagen no pertenece a este producto");
        }
        
        imagenProductoRepository.delete(imagen);
        log.info("Imagen {} eliminada exitosamente", imagenId);
        }
    
        /**
        * Obtener todos los productos (público)
        */
        @Transactional(readOnly = true)
        public List<ProductoDTO> obtenerTodosLosProductos() {
        List<Producto> productos = productoRepository
            .findByDisponibleTrueAndEstadoRevision(Producto.EstadoRevision.APROBADO);
        return convertirListaADTO(productos);
        }

        /**
        * Obtener producto público por ID con todas sus imágenes.
        */
        @Transactional(readOnly = true)
        public ProductoDTO obtenerProductoPublicoPorId(Long productoId) {
        Producto producto = productoRepository
                .findByIdAndDisponibleTrueAndEstadoRevision(productoId, Producto.EstadoRevision.APROBADO)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return convertirADTO(producto);
        }
    
        /**
        * Obtener productos por categoría (público)
        */
        @Transactional(readOnly = true)
        public List<ProductoDTO> obtenerProductosPorCategoria(Long categoriaId) {
        List<Producto> productos = productoRepository
                .findByCategoriaIdAndDisponibleTrueAndEstadoRevision(
                        categoriaId,
                        Producto.EstadoRevision.APROBADO
                );
        return convertirListaADTO(productos);
        }

        @Transactional(readOnly = true)
        public List<ProductoDTO> obtenerProductosPendientes() {
        List<Producto> productos = productoRepository.findByEstadoRevision(Producto.EstadoRevision.PENDIENTE);
        return convertirListaADTO(productos);
        }

        @Transactional(readOnly = true)
        public List<ProductoDTO> obtenerProductosConStockBajo() {
        List<Producto> productos = productoRepository.findProductosConStockBajo();
        return convertirListaADTO(productos);
        }

        @Transactional(readOnly = true)
        public List<ProductoDTO> obtenerMisProductosConStockBajo(Long usuarioId) {
        Proveedor proveedor = proveedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("No eres un proveedor"));

        List<Producto> productos = productoRepository.findProductosConStockBajoByProveedorId(proveedor.getId());
        return convertirListaADTO(productos);
        }

        @Transactional
        public ProductoDTO cambiarEstadoRevisionProducto(Long productoId, CambiarEstadoProductoDTO dto) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Producto.EstadoRevision nuevoEstado;

        try {
                nuevoEstado = Producto.EstadoRevision.valueOf(dto.getEstadoRevision().toUpperCase());
        } catch (IllegalArgumentException e) {
                throw new RuntimeException("Estado de revisión inválido. Usa PENDIENTE, APROBADO o RECHAZADO");
        }

        if (nuevoEstado == Producto.EstadoRevision.RECHAZADO) {
                if (dto.getMotivoRechazo() == null || dto.getMotivoRechazo().trim().isEmpty()) {
                throw new RuntimeException("Debes ingresar un motivo de rechazo");
                }
                producto.setMotivoRechazo(dto.getMotivoRechazo());
                producto.setDisponible(false);
        }

        if (nuevoEstado == Producto.EstadoRevision.APROBADO) {
                producto.setMotivoRechazo(null);
                producto.setDisponible(true);
        }

        if (nuevoEstado == Producto.EstadoRevision.PENDIENTE) {
                producto.setMotivoRechazo(null);
        }

        producto.setEstadoRevision(nuevoEstado);

        Producto actualizado = productoRepository.save(producto);
        return convertirADTO(actualizado);
        }
    
        /**
        * Convierte listas de productos evitando N+1 consultas de imágenes.
        */
        private List<ProductoDTO> convertirListaADTO(List<Producto> productos) {
                if (productos == null || productos.isEmpty()) {
                return List.of();
                }

                List<Long> productoIds = productos.stream()
                        .map(Producto::getId)
                        .collect(Collectors.toList());

                Map<Long, List<ImagenProducto>> imagenesPorProducto = imagenProductoRepository
                        .findByProductoIdIn(productoIds)
                        .stream()
                        .collect(Collectors.groupingBy(imagen -> imagen.getProducto().getId()));

                return productos.stream()
                        .map(producto -> convertirADTO(
                                producto,
                                imagenesPorProducto
                                        .getOrDefault(producto.getId(), List.of())
                                        .stream()
                                        .limit(1)
                                        .collect(Collectors.toList())
                        ))
                        .collect(Collectors.toList());
        }

        /**
        * Convertir Producto a DTO
        */
        private ProductoDTO convertirADTO(Producto producto) {
                return convertirADTO(producto, imagenProductoRepository.findByProductoId(producto.getId()));
        }

        private ProductoDTO convertirADTO(Producto producto, List<ImagenProducto> imagenesProducto) {
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

                dto.setEstadoRevision(
                        producto.getEstadoRevision() != null ? producto.getEstadoRevision().name() : "PENDIENTE"
                );

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

                if (agotado) {
                dto.setEstadoInventario("AGOTADO");
                } else if (stockBajo) {
                dto.setEstadoInventario("STOCK_BAJO");
                } else {
                dto.setEstadoInventario("DISPONIBLE");
                }
                
                // Imágenes ya precargadas para evitar consultas repetidas en listados.
                List<ImagenProductoDTO> imagenes = imagenesProducto
                        .stream()
                        .map(this::convertirAImagenDTO)
                        .collect(Collectors.toList());
                dto.setImagenes(imagenes);
                
                return dto;
        }
    
        /**
        * Convertir ImagenProducto a DTO
        */
        private ImagenProductoDTO convertirAImagenDTO(ImagenProducto imagen) {
                ImagenProductoDTO dto = new ImagenProductoDTO();
                dto.setId(imagen.getId());
                dto.setProductoId(imagen.getProducto().getId());
                dto.setUrlImagen(imagen.getUrlImagen());
                return dto;
        }
}