package com.shiptrack.config;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Previously there was no exception handling anywhere in the app, so any
 * unhandled RuntimeException (duplicate email, validation failures, "not
 * found", etc.) fell through to Spring Boot's default /error forward. That
 * path isn't permitted in SecurityConfig, and JwtAuthFilter skips itself on
 * ERROR dispatches (its default behaviour), so the forward looked
 * unauthenticated to Spring Security and came back as a misleading 401
 * "Not authenticated" -- masking whatever the real error was.
 *
 * This translates business-rule RuntimeExceptions into a real 400 with the
 * actual message, so the frontend (and whoever's debugging) sees the truth.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex, HttpServletRequest request) {

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");
        body.put("message", ex.getMessage());
        body.put("path", request.getRequestURI());

        return ResponseEntity.badRequest().body(body);
    }
}
