package com.marketplace.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {
    
    // Clave secreta para firmar el token (en producción usar variables de entorno)
    private static final String SECRET_KEY = "TuClaveSecretaSuperSeguraDeAlMenos256BitsParaHS256AlgorithmQueEsMuyLarga";
    private static final long EXPIRATION_TIME = 86400000; // 24 horas en milisegundos
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }
    
    /**
     * Genera un token JWT para un usuario
     */
    public String generarToken(String email, Long userId, String rol) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("rol", rol);
        
        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(getSigningKey())
                .compact();
    }
    
    /**
     * Valida si un token es válido
     */
    public boolean validarToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Extrae el email del token
     */
    public String extraerEmail(String token) {
        return extraerClaims(token).getSubject();
    }
    
    /**
     * Extrae el userId del token
     */
    public Long extraerUserId(String token) {
        return extraerClaims(token).get("userId", Long.class);
    }

    /**
     * Extrae el rol del token
     */
    public String extraerRol(String token) {
        return extraerClaims(token).get("rol", String.class);
    }
    
    /**
     * Extrae todos los claims del token
     */
    private Claims extraerClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
