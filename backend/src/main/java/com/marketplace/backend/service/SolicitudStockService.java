package com.marketplace.backend.service;

import com.marketplace.backend.dominio.Producto;
import com.marketplace.backend.dominio.SolicitudStock;
import com.marketplace.backend.dominio.Usuario;
import com.marketplace.backend.dto.CambiarEstadoSolicitudStockDTO;
import com.marketplace.backend.dto.CrearSolicitudStockDTO;
import com.marketplace.backend.dto.SolicitudStockDTO;
import com.marketplace.backend.repository.ProductoRepository;
import com.marketplace.backend.repository.SolicitudStockRepository;
import com.marketplace.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SolicitudStockService {

    private final SolicitudStockRepository solicitudStockRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public SolicitudStockDTO crearSolicitud(Long usuarioId, CrearSolicitudStockDTO dto) {
        log.info("Usuario {} enviando solicitud de stock para producto {}", usuarioId, dto.getProductoId());

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Producto producto = productoRepository.findById(dto.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (!Boolean.TRUE.equals(producto.getDisponible())) {
            throw new RuntimeException("El producto no está disponible para solicitudes");
        }

        if (producto.getEstadoRevision() != Producto.EstadoRevision.APROBADO) {
            throw new RuntimeException("El producto aún no está aprobado para venta");
        }

        if (dto.getCantidadSolicitada() <= producto.getStockDisponible()) {
            throw new RuntimeException("La cantidad solicitada no supera el stock disponible");
        }

        SolicitudStock solicitud = solicitudStockRepository
                .findByUsuarioIdAndProductoIdAndEstado(
                        usuarioId,
                        dto.getProductoId(),
                        SolicitudStock.EstadoSolicitudStock.PENDIENTE
                )
                .orElseGet(SolicitudStock::new);

        solicitud.setUsuario(usuario);
        solicitud.setProducto(producto);
        solicitud.setCantidadSolicitada(dto.getCantidadSolicitada());
        solicitud.setStockActual(producto.getStockDisponible());
        solicitud.setMensaje(dto.getMensaje());
        solicitud.setEstado(SolicitudStock.EstadoSolicitudStock.PENDIENTE);
        solicitud.setRespuestaAdmin(null);

        SolicitudStock guardada = solicitudStockRepository.save(solicitud);
        return convertirADTO(guardada);
    }

    @Transactional(readOnly = true)
    public List<SolicitudStockDTO> obtenerTodas() {
        return solicitudStockRepository.findAllByOrderByFechaSolicitudDesc()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SolicitudStockDTO> obtenerPendientes() {
        return solicitudStockRepository
                .findByEstadoOrderByFechaSolicitudDesc(SolicitudStock.EstadoSolicitudStock.PENDIENTE)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SolicitudStockDTO> obtenerMisSolicitudes(Long usuarioId) {
        return solicitudStockRepository.findByUsuarioIdOrderByFechaSolicitudDesc(usuarioId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public SolicitudStockDTO cambiarEstado(Long solicitudId, CambiarEstadoSolicitudStockDTO dto) {
        SolicitudStock solicitud = solicitudStockRepository.findById(solicitudId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        SolicitudStock.EstadoSolicitudStock nuevoEstado;
        try {
            nuevoEstado = SolicitudStock.EstadoSolicitudStock.valueOf(dto.getEstado().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Estado inválido. Usa PENDIENTE, EN_REVISION, ATENDIDA o RECHAZADA");
        }

        solicitud.setEstado(nuevoEstado);
        solicitud.setRespuestaAdmin(dto.getRespuestaAdmin());

        SolicitudStock actualizada = solicitudStockRepository.save(solicitud);
        return convertirADTO(actualizada);
    }

    private SolicitudStockDTO convertirADTO(SolicitudStock solicitud) {
        Producto producto = solicitud.getProducto();
        Usuario usuario = solicitud.getUsuario();

        SolicitudStockDTO dto = new SolicitudStockDTO();
        dto.setId(solicitud.getId());
        dto.setProductoId(producto.getId());
        dto.setNombreProducto(producto.getNombre());
        dto.setUnidadMedida(producto.getUnidadMedida());
        dto.setCantidadSolicitada(solicitud.getCantidadSolicitada());
        dto.setStockActual(solicitud.getStockActual());
        dto.setMensaje(solicitud.getMensaje());
        dto.setEstado(solicitud.getEstado().name());
        dto.setRespuestaAdmin(solicitud.getRespuestaAdmin());
        dto.setFechaSolicitud(solicitud.getFechaSolicitud());
        dto.setFechaActualizacion(solicitud.getFechaActualizacion());

        if (producto.getProveedor() != null) {
            dto.setProveedorId(producto.getProveedor().getId());
            dto.setNombreEmpresa(producto.getProveedor().getNombreEmpresa());
        }

        dto.setUsuarioId(usuario.getId());
        dto.setNombreUsuario(usuario.getNombre() + " " + usuario.getApellido());
        dto.setEmailUsuario(usuario.getEmail());
        dto.setTelefonoUsuario(usuario.getTelefono());

        return dto;
    }
}
