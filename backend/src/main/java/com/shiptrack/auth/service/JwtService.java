package com.shiptrack.auth.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.shiptrack.auth.entity.User;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Date;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;


@Service
public class JwtService     
{
    private static final String SECRET_KEY = 
                                             "mySecretKeyForJwtAuthentication12345678901234567890";  

    private final SecretKey key =
        Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

  public String generateToken(User user) {

        return Jwts.builder()
                .subject(user.getUsername())
                .claim("role", user.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
        }

    public String extractUsername(String token) {

    return extractAllClaims(token).getSubject();

    }

   private Claims extractAllClaims(String token) {

        Jws<Claims> claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);

    return claims.getPayload();

    }

    public Date extractExpiration(String token) {

    return extractAllClaims(token).getExpiration();

    }

    public boolean isTokenValid(String token, String username) {

    String extractedUsername = extractUsername(token);

    return extractedUsername.equals(username)
            && !extractExpiration(token).before(new Date());

    }
}
