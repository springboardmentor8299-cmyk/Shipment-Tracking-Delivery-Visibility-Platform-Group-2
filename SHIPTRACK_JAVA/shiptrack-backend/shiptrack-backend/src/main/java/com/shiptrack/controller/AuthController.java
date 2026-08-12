package com.shiptrack.controller;

import com.shiptrack.dto.AuthMessageResponse;
import com.shiptrack.dto.GoogleLoginRequest;
import com.shiptrack.dto.LoginRequest;
import com.shiptrack.dto.LoginResponse;
import com.shiptrack.dto.RegisterRequest;
import com.shiptrack.entity.User;
import com.shiptrack.service.JwtService;
import com.shiptrack.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import java.util.Map;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final JwtDecoder googleJwtDecoder;

    public AuthController(UserService userService,
                          JwtService jwtService,
                          JwtDecoder googleJwtDecoder) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.googleJwtDecoder = googleJwtDecoder;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthMessageResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = userService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthMessageResponse(
                        "Registration successful. Please log in.",
                        user.getEmail(),
                        user.getRole().getName()
                ));
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request) {

        User user = userService.login(request);

        String token = jwtService.generateToken(
                user.getEmail());

        return new LoginResponse(token);
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request) {

        Jwt idToken;
        try {
            idToken =
                    googleJwtDecoder.decode(
                            request.getIdToken());
        } catch (JwtException | IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "Invalid or expired Google token"));
        }

        String email =
                idToken.getClaimAsString("email");
        String fullName =
                idToken.getClaimAsString("name");

        User user =
                userService.findOrCreateOauthUser(
                        email,
                        fullName,
                        null);

        String token = jwtService.generateToken(
                user.getEmail());

        return ResponseEntity.ok(
                new LoginResponse(token));
    }

    @GetMapping("/me")
    public Map<String, String> getCurrentUser(
            Authentication authentication) {

        User user =
                userService.findByEmail(
                        authentication.getName());

        return Map.of(
                "email", user.getEmail(),
                "role", user.getRole().getName()
        );
    }
}
