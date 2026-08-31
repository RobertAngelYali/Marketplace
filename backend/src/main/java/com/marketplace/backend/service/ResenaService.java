package com.marketplace.backend.service;

import com.marketplace.backend.dominio.Producto;
import com.marketplace.backend.dominio.Resena;
import com.marketplace.backend.dominio.Usuario;
import com.marketplace.backend.dto.CrearResenaDTO;
import com.marketplace.backend.dto.ResenaDTO;
import com.marketplace.backend.repository.ProductoRepository;
import com.marketplace.backend.repository.ResenaRepository;
import com.marketplace.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResenaService {
    private final ResenaRepository resenaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<ResenaDTO> listarPorProducto(Long productoId) {
        productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        return resenaRepository.findByProductoIdOrderByFechaResenaDesc(productoId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ResenaDTO crearResena(Long usuarioId, Long productoId, CrearResenaDTO dto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (producto.getEstadoRevision() != Producto.EstadoRevision.APROBADO || !Boolean.TRUE.equals(producto.getDisponible())) {
            throw new RuntimeException("No se puede comentar un producto que no está publicado");
        }

        if (resenaRepository.existsByProductoIdAndUsuarioId(productoId, usuarioId)) {
            throw new RuntimeException("Ya publicaste un comentario para este producto");
        }

        String comentario = dto.getComentario() == null ? "" : dto.getComentario().trim();
        if (comentario.length() < 3) {
            throw new RuntimeException("El comentario debe tener al menos 3 caracteres");
        }

        Resena resena = new Resena();
        resena.setUsuario(usuario);
        resena.setProducto(producto);
        resena.setProveedor(producto.getProveedor());
        resena.setCalificacion(dto.getCalificacion());
        resena.setComentario(comentario);

        Resena guardada = resenaRepository.save(resena);
        actualizarPromedioProducto(producto);

        return convertirADTO(guardada);
    }

    private void actualizarPromedioProducto(Producto producto) {
        Double promedio = resenaRepository.obtenerPromedioCalificacion(producto.getId());
        BigDecimal promedioDecimal = BigDecimal.valueOf(promedio != null ? promedio : 0);
        producto.setCalificacionPromedio(promedioDecimal.setScale(1, RoundingMode.HALF_UP));
        productoRepository.save(producto);
    }

    private ResenaDTO convertirADTO(Resena resena) {
        String nombreUsuario = "Usuario";
        if (resena.getUsuario() != null) {
            String nombre = resena.getUsuario().getNombre() != null ? resena.getUsuario().getNombre() : "";
            String apellido = resena.getUsuario().getApellido() != null ? resena.getUsuario().getApellido() : "";
            nombreUsuario = (nombre + " " + apellido).trim();
            if (nombreUsuario.isEmpty()) {
                nombreUsuario = resena.getUsuario().getEmail();
            }
        }

        return new ResenaDTO(
                resena.getId(),
                resena.getUsuario() != null ? resena.getUsuario().getId() : null,
                nombreUsuario,
                resena.getProducto() != null ? resena.getProducto().getId() : null,
                resena.getProveedor() != null ? resena.getProveedor().getId() : null,
                resena.getCalificacion(),
                resena.getComentario(),
                resena.getFechaResena()
        );
    }
}
