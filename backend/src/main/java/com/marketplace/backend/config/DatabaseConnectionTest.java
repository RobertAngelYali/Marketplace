package com.marketplace.backend.config;

import javax.sql.DataSource;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.sql.Connection;

@Configuration
public class DatabaseConnectionTest {
    @Bean
    CommandLineRunner testConnection(DataSource dataSource) {
        return args -> {
            try (Connection connection = dataSource.getConnection()) {
                System.out.println("==============================================");
                System.out.println("==============================================");
                System.out.println("==============================================");
                System.out.println("==============================================");
                System.out.println("✓ CONEXIÓN A BASE DE DATOS EXITOSA");
                System.out.println("==============================================");
                System.out.println("==============================================");
                System.out.println("==============================================");
                System.out.println("==============================================");
            } catch (Exception e) {
                System.err.println("==============================================");
                System.out.println("==============================================");
                System.out.println("==============================================");
                System.err.println("✗ ERROR EN LA CONEXIÓN A BASE DE DATOS");
                System.err.println("Mensaje: " + e.getMessage());
                System.err.println("==============================================");
                System.out.println("==============================================");
                System.out.println("==============================================");
                e.printStackTrace();
            }
        };
    }
}
