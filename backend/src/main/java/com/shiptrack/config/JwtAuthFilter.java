package com.shiptrack.config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.shiptrack.auth.service.JwtService;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    // Read by JwtAuthenticationEntryPoint when a request ends up unauthenticated,
    // so the client gets a real reason instead of a bare 403/401.
    public static final String AUTH_ERROR_ATTR = "jwt_auth_error";

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        if (path.startsWith("/api/auth")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            request.setAttribute(AUTH_ERROR_ATTR,
                    "No Authorization header (or it doesn't start with 'Bearer ') was sent with this request.");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String username;

        try {
            username = jwtService.extractUsername(token);
        } catch (ExpiredJwtException e) {
            request.setAttribute(AUTH_ERROR_ATTR, "Your session has expired. Please log in again.");
            filterChain.doFilter(request, response);
            return;
        } catch (JwtException | IllegalArgumentException e) {
            request.setAttribute(AUTH_ERROR_ATTR, "The auth token is invalid or malformed: " + e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        if (username != null
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails;
            try {
                userDetails = userDetailsService.loadUserByUsername(username);
            } catch (Exception e) {
                request.setAttribute(AUTH_ERROR_ATTR,
                        "Token is valid but the user '" + username + "' no longer exists.");
                filterChain.doFilter(request, response);
                return;
            }

            if (jwtService.isTokenValid(token, userDetails.getUsername())) {

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities());

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request));

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
            } else {
                request.setAttribute(AUTH_ERROR_ATTR, "Token failed validation for user '" + username + "'.");
            }
        }

        filterChain.doFilter(request, response);
    }
}