package com.marketplace.backend.service;

import com.marketplace.backend.dominio.*;
import com.marketplace.backend.dto.CrearPedidoDTO;
import com.marketplace.backend.dto.DetallePedidoDTO;
import com.marketplace.backend.dto.PedidoDetalleCompletoDTO;
import com.marketplace.backend.repository.*;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final CarritoRepository carritoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ImagenProductoRepository imagenProductoRepository;

    @Transactional
    public Pedido crearPedido(Long usuarioId, CrearPedidoDTO dto) {
        log.info("Iniciando proceso de checkout para usuario: {}", usuarioId);

        // 1. Obtener usuario
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Obtener items del carrito
        List<Carrito> itemsCarrito = carritoRepository.findByUsuarioIdWithAvailableProducts(usuarioId);

        if (itemsCarrito.isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        // --- CORRECCIÓN: CALCULAR TOTAL ANTES DE GUARDAR ---
        BigDecimal totalCalculado = BigDecimal.ZERO;
        for (Carrito item : itemsCarrito) {
            BigDecimal subtotalItem = item.getProducto().getPrecioUnitario()
                    .multiply(new BigDecimal(item.getCantidad()));
            totalCalculado = totalCalculado.add(subtotalItem);
        }

        // 3. Crear cabecera del Pedido
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setNumeroPedido(generarNumeroPedido());
        pedido.setFechaPedido(LocalDateTime.now());
        pedido.setEstado(Pedido.EstadoPedido.pendiente); // Usar el enum que tengas (PENDIENTE o pendiente)
        pedido.setDireccionEntrega(dto.getDireccionEntrega());
        pedido.setTelefonoContacto(dto.getTelefonoContacto());
        pedido.setMetodoPago(dto.getMetodoPago() != null ? dto.getMetodoPago() : "TARJETA");

        // Asignamos el total calculado para pasar la validación @DecimalMin
        pedido.setTotal(totalCalculado);

        // Guardamos el pedido (Ahora sí pasará porque total > 0)
        pedido = pedidoRepository.save(pedido);

        // 4. Procesar items y crear DetallePedido (y actualizar stock)
        for (Carrito item : itemsCarrito) {
            Producto producto = item.getProducto();

            // Validar stock nuevamente
            if (producto.getStockDisponible() < item.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para: " + producto.getNombre());
            }

            // Descontar Stock
            producto.setStockDisponible(producto.getStockDisponible() - item.getCantidad());
            productoRepository.save(producto);

            // Crear Detalle
            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setProducto(producto);
            detalle.setProveedor(producto.getProveedor());
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecioUnitario());
            detalle.setSubtotal(producto.getPrecioUnitario().multiply(new BigDecimal(item.getCantidad())));

            detallePedidoRepository.save(detalle);
        }

        // 5. Vaciar carrito
        carritoRepository.deleteByUsuarioId(usuarioId);

        log.info("Pedido {} creado con éxito por un total de {}", pedido.getNumeroPedido(), totalCalculado);
        return pedido;
    }

    private String generarNumeroPedido() {
        return "PED-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @Transactional(readOnly = true)
    public List<Pedido> obtenerPedidosUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdOrderByFechaPedidoDesc(usuarioId);
    }

    // ⭐ NUEVO MÉTODO: Obtener detalle completo de un pedido
    @Transactional(readOnly = true)
    public PedidoDetalleCompletoDTO obtenerDetallePedido(Long pedidoId, Long usuarioId) {
        log.info("Obteniendo detalle del pedido {} para usuario {}", pedidoId, usuarioId);

        // 1. Verificar que el pedido existe y pertenece al usuario
        Pedido pedido = pedidoRepository.findByIdAndUsuarioId(pedidoId, usuarioId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado o no tienes acceso a este pedido"));

        // 2. Obtener los detalles del pedido con productos y proveedores
        List<DetallePedido> detalles = detallePedidoRepository.findByPedidoIdWithProductoAndProveedor(pedidoId);

        if (detalles.isEmpty()) {
            throw new RuntimeException("No se encontraron productos en este pedido");
        }

        // 3. Obtener los IDs de todos los productos
        List<Long> productoIds = detalles.stream()
                .map(d -> d.getProducto().getId())
                .collect(Collectors.toList());

        // 4. Obtener todas las imágenes en UNA sola consulta (optimización)
        List<ImagenProducto> todasLasImagenes = imagenProductoRepository.findByProductoIdIn(productoIds);

        // 5. Agrupar imágenes por productoId para acceso rápido
        Map<Long, List<ImagenProducto>> imagenesPorProducto = todasLasImagenes.stream()
                .collect(Collectors.groupingBy(img -> img.getProducto().getId()));

        // 6. Mapear los detalles a DTOs
        List<DetallePedidoDTO> productosDTO = detalles.stream().map(detalle -> {
            DetallePedidoDTO dto = new DetallePedidoDTO();
            dto.setId(detalle.getId());
            dto.setNombreProducto(detalle.getProducto().getNombre());
            dto.setCantidad(detalle.getCantidad());
            dto.setPrecioUnitario(detalle.getPrecioUnitario());
            dto.setSubtotal(detalle.getSubtotal());
            dto.setNombreProveedor(detalle.getProveedor().getNombreEmpresa());
            dto.setProveedorId(detalle.getProveedor().getId());

            // Obtener la primera imagen del Map (optimizado)
            List<ImagenProducto> imagenesProducto = imagenesPorProducto.get(detalle.getProducto().getId());
            if (imagenesProducto != null && !imagenesProducto.isEmpty()) {
                dto.setImagenUrl(imagenesProducto.get(0).getUrlImagen());
            } else {
                dto.setImagenUrl(null); // O una URL de imagen por defecto
            }

            return dto;
        }).collect(Collectors.toList());

        // 7. Crear el DTO completo del pedido
        PedidoDetalleCompletoDTO pedidoCompleto = new PedidoDetalleCompletoDTO();
        pedidoCompleto.setId(pedido.getId());
        pedidoCompleto.setNumeroPedido(pedido.getNumeroPedido());
        pedidoCompleto.setFechaPedido(pedido.getFechaPedido());
        pedidoCompleto.setEstado(pedido.getEstado().name());
        pedidoCompleto.setTotal(pedido.getTotal());
        pedidoCompleto.setDireccionEntrega(pedido.getDireccionEntrega());
        pedidoCompleto.setTelefonoContacto(pedido.getTelefonoContacto());
        pedidoCompleto.setMetodoPago(pedido.getMetodoPago());
        pedidoCompleto.setProductos(productosDTO);

        log.info("Detalle del pedido {} obtenido exitosamente con {} productos", pedidoId, productosDTO.size());

        return pedidoCompleto;
    }
}