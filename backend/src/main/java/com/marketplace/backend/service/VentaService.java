package com.marketplace.backend.service;

import com.marketplace.backend.dominio.*;
import com.marketplace.backend.dto.VentaDTO;
import com.marketplace.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final DetallePedidoRepository detallePedidoRepository;
    private final ProveedorRepository proveedorRepository;
    private final ImagenProductoRepository imagenProductoRepository; // Para la foto

    @Transactional(readOnly = true)
    public List<VentaDTO> obtenerVentasPorProveedor(Long usuarioId) {
        // 1. Buscar el proveedor asociado al usuario
        Proveedor proveedor = proveedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("No se encontró un perfil de proveedor para este usuario"));

        // 2. Obtener los detalles de pedido de este proveedor
        // OJO: Casteamos a Integer si tu Entidad Proveedor usa Integer ID, si usa Long quita el .intValue()
        List<DetallePedido> ventas = detallePedidoRepository.findByProveedorIdOrderByPedidoFechaPedidoDesc(proveedor.getId());

        // 3. Convertir a DTOs
        return ventas.stream().map(this::convertirADTO).collect(Collectors.toList());
    }

    private VentaDTO convertirADTO(DetallePedido detalle) {
        VentaDTO dto = new VentaDTO();
        dto.setId(detalle.getId());
        
        Pedido pedido = detalle.getPedido();
        Producto producto = detalle.getProducto();
        
        dto.setNumeroPedido(pedido.getNumeroPedido());
        dto.setFechaVenta(pedido.getFechaPedido());
        dto.setEstadoPedido(pedido.getEstado().toString());
        
        // Datos del cliente
        dto.setClienteNombre(pedido.getUsuario().getNombre() + " " + pedido.getUsuario().getApellido());
        
        // Datos del producto
        dto.setNombreProducto(producto.getNombre());
        dto.setCantidad(detalle.getCantidad());
        dto.setPrecioUnitario(detalle.getPrecioUnitario());
        dto.setSubtotal(detalle.getSubtotal());
        
        // Obtener primera imagen
        List<ImagenProducto> imagenes = imagenProductoRepository.findByProductoId(producto.getId());
        if (!imagenes.isEmpty()) {
            dto.setImagenUrl(imagenes.get(0).getUrlImagen());
        }
        
        return dto;
    }
}