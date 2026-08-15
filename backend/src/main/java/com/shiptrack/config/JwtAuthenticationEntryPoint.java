package com.shiptrack.config;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Runs whenever a request reaches a protected endpoint without a valid
 * authenticated principal. Previously Spring's default fallback
 * (Http403ForbiddenEntryPoint) returned a bare 403 here, which is
 * misleading -- 401 is the correct code for "you're not authenticated",
 * and we now say exactly why (missing header / expired token / bad
 * signature / etc), using the reason JwtAuthFilter left on the request.
 */
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException) throws IOException, ServletException {

        String reason = (String) request.getAttribute(JwtAuthFilter.AUTH_ERROR_ATTR);
        if (reason == null) {
            reason = "Not authenticated.";
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 401);
        body.put("error", "Unauthorized");
        body.put("message", reason);
        body.put("path", request.getRequestURI());

        objectMapper.writeValue(response.getWriter(), body);
    }
}