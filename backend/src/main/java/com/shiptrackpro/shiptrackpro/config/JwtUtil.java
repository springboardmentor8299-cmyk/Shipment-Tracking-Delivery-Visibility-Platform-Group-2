package com.shiptrackpro.shiptrackpro.config;

import java.security.Key;
import java.util.Date;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

public class JwtUtil {

    // Secret Key (at least 32 characters)
    private static final String SECRET =
            "shiptrackprosecretkeyshiptrackpro123456";

    private static final Key KEY =
            Keys.hmacShaKeyFor(SECRET.getBytes());

    // Generate Token
    public static String generateToken(String email) {

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + 86400000)
                ) // 24 Hours
                .signWith(KEY, SignatureAlgorithm.HS256)
                .compact();

    }

    // Extract Email
    public static String extractEmail(String token) {

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();

    }

    // Validate Token
    public static boolean validateToken(String token) {

        try {

            Jwts.parserBuilder()
                    .setSigningKey(KEY)
                    .build()
                    .parseClaimsJws(token);

            return true;

        } catch (Exception e) {

            return false;

        }

    }

}