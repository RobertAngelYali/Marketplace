package com.marketplace.backend.service;

import com.marketplace.backend.dominio.Proveedor;
import com.marketplace.backend.dominio.Usuario;
import com.marketplace.backend.dto.CambiarRolUsuarioDTO;
import com.marketplace.backend.dto.ProveedorDTO;
import com.marketplace.backend.dto.SolicitudProveedorDTO;
import com.marketplace.backend.repository.ProveedorRepository;
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
public class ProveedorService {
    
    private final ProveedorRepository proveedorRepository;
    private final UsuarioRepository usuarioRepository;
    
    /**
     * Usuario solicita ser proveedor
     */
    @Transactional
    public ProveedorDTO solicitarSerProveedor(Long usuarioId, SolicitudProveedorDTO dto) {
        log.info("Usuario {} solicita ser proveedor", usuarioId);
        
        // Verificar que el usuario existe
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Verificar que no tenga ya una solicitud
        if (proveedorRepository.existsByUsuarioId(usuarioId)) {
            throw new RuntimeException("Ya tienes una solicitud de proveedor");
        }
        
        // Verificar que el RUC no esté registrado
        if (proveedorRepository.existsByRuc(dto.getRuc())) {
            throw new RuntimeException("El RUC ya está registrado");
        }
        
        // Crear solicitud de proveedor
        Proveedor proveedor = new Proveedor();
        proveedor.setUsuario(usuario);
        proveedor.setRuc(dto.getRuc());
        proveedor.setNombreEmpresa(dto.getNombreEmpresa());
        proveedor.setRazonSocial(dto.getRazonSocial());
        proveedor.setDescripcion(dto.getDescripcion());
        proveedor.setDireccion(dto.getDireccion());
        proveedor.setTelefonoEmpresa(dto.getTelefonoEmpresa());
        proveedor.setEmailEmpresa(dto.getEmailEmpresa());
        proveedor.setEstado(Proveedor.EstadoProveedor.PENDIENTE);
        
        Proveedor guardado = proveedorRepository.save(proveedor);
        log.info("Solicitud de proveedor creada con ID: {}", guardado.getId());
        
        return convertirADTO(guardado);
    }
    
    /**
     * Obtener mi solicitud (usuario)
     */
    @Transactional(readOnly = true)
    public ProveedorDTO obtenerMiSolicitud(Long usuarioId) {
        log.info("Obteniendo solicitud del usuario: {}", usuarioId);
        
        Proveedor proveedor = proveedorRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("No tienes solicitud de proveedor"));
        
        return convertirADTO(proveedor);
    }
    
    /**
     * Verificar si tengo solicitud (usuario)
     */
    @Transactional(readOnly = true)
    public boolean tieneSolicitud(Long usuarioId) {
        return proveedorRepository.existsByUsuarioId(usuarioId);
    }
    
    /**
     * Obtener todas las solicitudes (admin)
     */
    @Transactional(readOnly = true)
    public List<ProveedorDTO> obtenerTodasLasSolicitudes() {
        log.info("Obteniendo todas las solicitudes de proveedores");
        
        return proveedorRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener solicitudes pendientes (admin)
     */
    @Transactional(readOnly = true)
    public List<ProveedorDTO> obtenerSolicitudesPendientes() {
        log.info("Obteniendo solicitudes pendientes");
        
        return proveedorRepository.findByEstado(Proveedor.EstadoProveedor.PENDIENTE)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Cambiar estado de solicitud de proveedor (admin)
     * Si se aprueba, cambia el rol del usuario a proveedor
     */
    @Transactional
    public ProveedorDTO cambiarEstadoSolicitud( Long proveedorId, String nuevoEstado) {
        log.info("Cambiando estado de proveedor {} a {}", proveedorId, nuevoEstado);
        
        Proveedor proveedor = proveedorRepository.findById(proveedorId)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
        
        // Convertir string a enum
        Proveedor.EstadoProveedor estado;
        try {
            estado = Proveedor.EstadoProveedor.valueOf(nuevoEstado.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Estado inválido: " + nuevoEstado);
        }
        
        proveedor.setEstado(estado);
        
        // Si se aprueba, cambiar el rol del usuario a proveedor
        if (estado == Proveedor.EstadoProveedor.APROBADO) {
            Usuario usuario = proveedor.getUsuario();
            usuario.setRol(Usuario.RolUsuario.proveedor);
            usuarioRepository.save(usuario);
            log.info("Usuario {} cambiado a rol PROVEEDOR", usuario.getId());
        }
        
        // Si se rechaza o suspende, asegurarse que el rol sea usuario
        if (estado == Proveedor.EstadoProveedor.RECHAZADO || estado == Proveedor.EstadoProveedor.SUSPENDIDO) {
            Usuario usuario = proveedor.getUsuario();
            if (usuario.getRol() == Usuario.RolUsuario.proveedor) {
                usuario.setRol(Usuario.RolUsuario.usuario);
                usuarioRepository.save(usuario);
                log.info("Usuario {} cambiado a rol USUARIO", usuario.getId());
            }
        }
        
        Proveedor actualizado = proveedorRepository.save(proveedor);
        return convertirADTO(actualizado);
    }
    
    /**
     * Cambiar rol de un usuario directamente (admin)
     */
    @Transactional
    public void cambiarRolUsuario( Long usuarioId, CambiarRolUsuarioDTO dto) {
        log.info("Cambiando rol de usuario {} a {}", usuarioId, dto.getRol());
        
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        usuario.setRol(dto.getRol());
        usuarioRepository.save(usuario);
        
        log.info("Rol de usuario {} actualizado a {}", usuarioId, dto.getRol());
    }
    
    /**
     * Convertir Proveedor a DTO
     */
    private ProveedorDTO convertirADTO(Proveedor proveedor) {
        ProveedorDTO dto = new ProveedorDTO();
        dto.setId(proveedor.getId());
        dto.setUsuarioId(proveedor.getUsuario().getId());
        dto.setNombreUsuario(proveedor.getUsuario().getNombre() + " " + proveedor.getUsuario().getApellido());
        dto.setEmailUsuario(proveedor.getUsuario().getEmail());
        dto.setRuc(proveedor.getRuc());
        dto.setNombreEmpresa(proveedor.getNombreEmpresa());
        dto.setRazonSocial(proveedor.getRazonSocial());
        dto.setDescripcion(proveedor.getDescripcion());
        dto.setDireccion(proveedor.getDireccion());
        dto.setTelefonoEmpresa(proveedor.getTelefonoEmpresa());
        dto.setEmailEmpresa(proveedor.getEmailEmpresa());
        dto.setEstado(proveedor.getEstado().name());
        dto.setFechaRegistro(proveedor.getFechaRegistro());
        dto.setCalificacionPromedio(proveedor.getCalificacionPromedio());
        return dto;
    }
}