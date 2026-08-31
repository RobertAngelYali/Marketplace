package com.marketplace.backend.service;
import com.marketplace.backend.dominio.Carrito;
import com.marketplace.backend.dominio.ImagenProducto;
import com.marketplace.backend.dominio.Producto;
import com.marketplace.backend.dominio.Usuario;
import com.marketplace.backend.dto.AgregarCarritoDTO;
import com.marketplace.backend.dto.ActualizarCantidadDTO;
import com.marketplace.backend.dto.CarritoItemDTO;
import com.marketplace.backend.dto.CarritoResumenDTO;
import com.marketplace.backend.repository.CarritoRepository;
import com.marketplace.backend.repository.ImagenProductoRepository;
import com.marketplace.backend.repository.ProductoRepository;
import com.marketplace.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CarritoService {
private final CarritoRepository carritoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ImagenProductoRepository imagenProductoRepository;
    
    /**
     * Agregar producto al carrito
     * Si el producto ya existe, suma las cantidades
     */
    @Transactional
    public CarritoItemDTO agregarProducto(Long usuarioId, AgregarCarritoDTO dto) {
        log.info("Usuario {} agregando producto {} al carrito", usuarioId, dto.getProductoId());
        
        // Verificar usuario
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Verificar producto
        Producto producto = productoRepository.findById(dto.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        // Validar que el producto esté disponible
        if (!producto.getDisponible()) {
            throw new RuntimeException("El producto no está disponible");
        }
        
        // Validar cantidad mínima
        if (dto.getCantidad() < producto.getCantidadMinima()) {
            throw new RuntimeException("La cantidad mínima de compra es " + producto.getCantidadMinima());
        }
        
        // Validar stock
        if (dto.getCantidad() > producto.getStockDisponible()) {
            throw new RuntimeException("Stock insuficiente. Disponible: " + producto.getStockDisponible());
        }
        
        // Verificar si ya existe en el carrito
        Carrito carrito = carritoRepository.findByUsuarioIdAndProductoId(usuarioId, dto.getProductoId())
                .orElse(null);
        
        if (carrito != null) {
            // Ya existe, sumar cantidades
            int nuevaCantidad = carrito.getCantidad() + dto.getCantidad();
            
            // Validar que la nueva cantidad no exceda el stock
            if (nuevaCantidad > producto.getStockDisponible()) {
                throw new RuntimeException("Stock insuficiente para agregar más unidades. Disponible: " + producto.getStockDisponible());
            }
            
            carrito.setCantidad(nuevaCantidad);
            log.info("Producto {} ya existía en carrito, nueva cantidad: {}", dto.getProductoId(), nuevaCantidad);
        } else {
            // Nuevo item
            carrito = new Carrito();
            carrito.setUsuario(usuario);
            carrito.setProducto(producto);
            carrito.setCantidad(dto.getCantidad());
            log.info("Nuevo item agregado al carrito");
        }
        
        Carrito guardado = carritoRepository.save(carrito);
        return convertirACarritoItemDTO(guardado);
    }
    
    /**
     * Obtener carrito completo del usuario
     */
    @Transactional(readOnly = true)
    public CarritoResumenDTO obtenerCarrito(Long usuarioId) {
        log.info("Obteniendo carrito del usuario {}", usuarioId);
        
        List<Carrito> items = carritoRepository.findByUsuarioIdWithAvailableProducts(usuarioId);
        
        List<CarritoItemDTO> itemsDTO = items.stream()
                .map(this::convertirACarritoItemDTO)
                .collect(Collectors.toList());
        
        // Calcular totales
        int cantidadTotal = itemsDTO.size();
        int cantidadProductos = itemsDTO.stream()
                .mapToInt(CarritoItemDTO::getCantidad)
                .sum();
        BigDecimal subtotal = itemsDTO.stream()
                .map(CarritoItemDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Contar proveedores distintos
        long totalProveedores = itemsDTO.stream()
                .map(CarritoItemDTO::getProveedorId)
                .distinct()
                .count();
        
        CarritoResumenDTO resumen = new CarritoResumenDTO();
        resumen.setItems(itemsDTO);
        resumen.setCantidadTotal(cantidadTotal);
        resumen.setCantidadProductos(cantidadProductos);
        resumen.setSubtotal(subtotal);
        resumen.setTotalProveedores((int) totalProveedores);
        
        return resumen;
    }
    
    /**
     * Actualizar cantidad de un producto en el carrito
     */
    @Transactional
    public CarritoItemDTO actualizarCantidad(Long usuarioId,Long carritoId, ActualizarCantidadDTO dto) {
        log.info("Actualizando cantidad del item {} del usuario {}", carritoId, usuarioId);
        
        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(() -> new RuntimeException("Item del carrito no encontrado"));
        
        // Verificar que el carrito pertenece al usuario
        if (!carrito.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("No tienes permiso para modificar este item");
        }
        
        Producto producto = carrito.getProducto();
        
        // Validar cantidad mínima
        if (dto.getCantidad() < producto.getCantidadMinima()) {
            throw new RuntimeException("La cantidad mínima de compra es " + producto.getCantidadMinima());
        }
        
        // Validar stock
        if (dto.getCantidad() > producto.getStockDisponible()) {
            throw new RuntimeException("Stock insuficiente. Disponible: " + producto.getStockDisponible());
        }
        
        carrito.setCantidad(dto.getCantidad());
        Carrito actualizado = carritoRepository.save(carrito);
        
        log.info("Cantidad actualizada a {}", dto.getCantidad());
        return convertirACarritoItemDTO(actualizado);
    }
    
    /**
     * Eliminar un producto del carrito
     */
    @Transactional
    public void eliminarProducto(Long usuarioId,Long carritoId) {
        log.info("Eliminando item {} del carrito del usuario {}", carritoId, usuarioId);
        
        Carrito carrito = carritoRepository.findById(carritoId)
                .orElseThrow(() -> new RuntimeException("Item del carrito no encontrado"));
        
        // Verificar que el carrito pertenece al usuario
        if (!carrito.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("No tienes permiso para eliminar este item");
        }
        
        carritoRepository.delete(carrito);
        log.info("Item eliminado del carrito");
    }
    
    /**
     * Vaciar carrito completo
     */
    @Transactional
    public void vaciarCarrito(Long usuarioId) {
        log.info("Vaciando carrito del usuario {}", usuarioId);
        carritoRepository.deleteByUsuarioId(usuarioId);
        log.info("Carrito vaciado");
    }
    
    /**
     * Limpiar productos no disponibles del carrito
     */
    @Transactional
    public void limpiarProductosNoDisponibles(Long usuarioId) {
        log.info("Limpiando productos no disponibles del usuario {}", usuarioId);
        carritoRepository.deleteUnavailableProductsByUsuarioId(usuarioId);
        log.info("Productos no disponibles eliminados");
    }
    
    /**
     * Contar items en el carrito
     */
    @Transactional(readOnly = true)
    public Long contarItems(Long usuarioId) {
        return carritoRepository.countByUsuarioId(usuarioId);
    }
    
    /**
     * Convertir Carrito a CarritoItemDTO
     */
    private CarritoItemDTO convertirACarritoItemDTO(Carrito carrito) {
        Producto producto = carrito.getProducto();
        
        CarritoItemDTO dto = new CarritoItemDTO();
        dto.setId(carrito.getId());
        dto.setProductoId(producto.getId());
        dto.setNombreProducto(producto.getNombre());
        dto.setDescripcionProducto(producto.getDescripcion());
        dto.setPrecioUnitario(producto.getPrecioUnitario());
        dto.setUnidadMedida(producto.getUnidadMedida());
        dto.setCantidad(carrito.getCantidad());
        dto.setCantidadMinima(producto.getCantidadMinima());
        dto.setStockDisponible(producto.getStockDisponible());
        
        // Calcular subtotal
        BigDecimal subtotal = producto.getPrecioUnitario()
                .multiply(BigDecimal.valueOf(carrito.getCantidad()));
        dto.setSubtotal(subtotal);
        
        // Información del proveedor
        dto.setProveedorId(producto.getProveedor().getId());
        dto.setNombreEmpresa(producto.getProveedor().getNombreEmpresa());
        
        // Primera imagen del producto
        List<ImagenProducto> imagenes = imagenProductoRepository.findByProductoId(producto.getId());
        if (!imagenes.isEmpty()) {
            dto.setImagenUrl(imagenes.get(0).getUrlImagen());
        }
        
        dto.setDisponible(producto.getDisponible());
        dto.setFechaAgregado(carrito.getFechaAgregado());
        
        return dto;
    }
}
