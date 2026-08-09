package com.shiptrackpro.shiptrackpro.security;


import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Service;

import com.shiptrackpro.shiptrackpro.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;


@Service
public class JwtService {


    private static final String SECRET =
            "shiptrackpro_secret_key_for_jwt_authentication_2026_123456789";


    private static final Key KEY =
            Keys.hmacShaKeyFor(
                    SECRET.getBytes()
            );


    private static final long EXPIRATION =
            1000 * 60 * 60 * 24; // 24 hours






    // Generate JWT Token with Email + Role
    public String generateToken(User user) {


        return Jwts.builder()

                .setSubject(user.getEmail())

                .claim(
                        "role",
                        user.getRole().name()
                )

                .setIssuedAt(
                        new Date()
                )

                .setExpiration(
                        new Date(
                            System.currentTimeMillis()
                            + EXPIRATION
                        )
                )

                .signWith(KEY)

                .compact();

    }







    // Extract Email from Token
    public String extractEmail(String token) {


        Claims claims =
                Jwts.parserBuilder()

                .setSigningKey(KEY)

                .build()

                .parseClaimsJws(token)

                .getBody();



        return claims.getSubject();

    }








    // Extract Role from Token
    public String extractRole(String token) {


        Claims claims =
                Jwts.parserBuilder()

                .setSigningKey(KEY)

                .build()

                .parseClaimsJws(token)

                .getBody();



        return claims.get(
                "role",
                String.class
        );

    }








    // Validate Token
    public boolean validateToken(
            String token,
            String email
    ) {


        return extractEmail(token)
                .equals(email);

    }


}