package com.shiptrack.backend.controller;

import com.shiptrack.backend.dto.LoginResponse;
import com.shiptrack.backend.dto.LoginRequest;
import com.shiptrack.backend.dto.RegistrationRequest;
import com.shiptrack.backend.entity.User;
import com.shiptrack.backend.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register User
     */
    @PostMapping("/register")
    public ResponseEntity<User> register(
            @RequestBody RegistrationRequest request) {
        User savedUser = authService.register(request);
        return ResponseEntity.ok(savedUser);
    }

    /**
     * Login User
     */
    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request) {

        String token = authService.login(
                request.getEmail(),
                request.getPassword()
        );

        var user = authService.findByEmail(request.getEmail());

        return new LoginResponse(
                token,
                "Login successful",
                user.getRole(),
                user.getUsername(),
                user.getEmail(),
                user.getId()
        );
    }

    /**
     * Forgot / Reset Password
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<java.util.Map<String, String>> forgotPassword(
            @RequestBody com.shiptrack.backend.dto.ForgotPasswordRequest request) {

        String resultMessage = authService.resetPassword(
                request.getEmail(),
                request.getNewPassword()
        );

        return ResponseEntity.ok(java.util.Map.of("message", resultMessage));
    }
}