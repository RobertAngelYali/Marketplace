package com.marketplace.backend.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Crea la tabla favoritos si la base de datos fue cargada desde un backup antiguo
 * que todavía no contiene esta funcionalidad.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class FavoritosTableInitializer {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void crearTablaSiNoExiste() {
        String sql = """
                CREATE TABLE IF NOT EXISTS favoritos (
                  id BIGINT NOT NULL AUTO_INCREMENT,
                  usuario_id INT NOT NULL,
                  producto_id INT NOT NULL,
                  fecha_agregado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  PRIMARY KEY (id),
                  UNIQUE KEY uk_favorito_usuario_producto (usuario_id, producto_id),
                  KEY idx_favoritos_usuario (usuario_id),
                  KEY idx_favoritos_producto (producto_id),
                  CONSTRAINT favoritos_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                  CONSTRAINT favoritos_ibfk_2 FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """;

        try {
            jdbcTemplate.execute(sql);
            log.info("Tabla favoritos verificada correctamente");
        } catch (Exception e) {
            log.warn("No se pudo crear/verificar la tabla favoritos: {}", e.getMessage());
        }
    }
}
