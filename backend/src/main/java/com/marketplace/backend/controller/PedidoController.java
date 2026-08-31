package com.marketplace.backend.controller;

import com.marketplace.backend.dominio.Pedido;
import com.marketplace.backend.dto.CrearPedidoDTO;
import com.marketplace.backend.dto.PedidoDetalleCompletoDTO;
import com.marketplace.backend.security.JwtUtil;
import com.marketplace.backend.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoService pedidoService;
    private final JwtUtil jwtUtil;

    @GetMapping("/mis-pedidos")
    public ResponseEntity<?> obtenerMisPedidos(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);

            List<Pedido> pedidos = pedidoService.obtenerPedidosUsuario(usuarioId);

            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error al obtener pedidos: " + e.getMessage());
        }
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> realizarPedido(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CrearPedidoDTO dto) {

        Map<String, Object> response = new HashMap<>();
        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);

            Pedido pedido = pedidoService.crearPedido(usuarioId, dto);

            response.put("success", true);
            response.put("message", "Pedido realizado con éxito");
            response.put("id", pedido.getId());
            response.put("numeroPedido", pedido.getNumeroPedido());
            response.put("fechaPedido", pedido.getFechaPedido());
            response.put("estado", pedido.getEstado().name());
            response.put("total", pedido.getTotal());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/{pedidoId}/detalles")
    public ResponseEntity<?> obtenerDetallePedido(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long pedidoId) {
        try {
            String token = authHeader.substring(7);
            Long usuarioId = jwtUtil.extraerUserId(token);

            PedidoDetalleCompletoDTO detalle = pedidoService.obtenerDetallePedido(pedidoId, usuarioId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", detalle);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error al obtener el detalle del pedido");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}