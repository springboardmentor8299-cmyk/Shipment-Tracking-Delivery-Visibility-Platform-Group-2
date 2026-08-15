package com.shiptrack.config;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Runs when the request IS authenticated but the account's role doesn't
 * satisfy the endpoint's required role (a genuine 403). Reports which
 * authorities the account actually has, so a role mismatch is obvious
 * immediately instead of a bare 403 with no context.
 */
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException, ServletException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", 403);
        body.put("error", "Forbidden");
        body.put("path", request.getRequestURI());

        if (auth != null) {
            body.put("message",
                    "User '" + auth.getName() + "' is authenticated but does not have the "
                            + "required role for this endpoint. Authorities: " + auth.getAuthorities());
        } else {
            body.put("message", "Access denied and no authentication was found in the security context.");
        }

        objectMapper.writeValue(response.getWriter(), body);
    }
}