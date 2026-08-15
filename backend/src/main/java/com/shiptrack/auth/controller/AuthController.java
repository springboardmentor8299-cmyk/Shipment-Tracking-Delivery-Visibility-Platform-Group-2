package com.shiptrack.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shiptrack.auth.dto.AuthResponse;
import com.shiptrack.auth.dto.ForgotPasswordRequest;
import com.shiptrack.auth.dto.Googleauthrequest;
import com.shiptrack.auth.dto.MessageResponse;
import com.shiptrack.auth.dto.RegisterRequest;
import com.shiptrack.auth.dto.ResetPasswordRequest;
import com.shiptrack.auth.service.AuthService;

import com.shiptrack.auth.dto.LoginRequest;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;

@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "https://shipment-tracking-platform.onrender.com"
})
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {

        AuthResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {

        System.out.println("******** LOGIN API HIT ********");

        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleAuth(@RequestBody Googleauthrequest request) {

        AuthResponse response = authService.googleAuth(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public String profile(Authentication authentication) {

        return "Logged in as : " + authentication.getName();

    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        System.out.println("******** FORGOT PASSWORD HIT: " + request.getUsername() + " ********");
        authService.forgotPassword(request.getUsername());

        return ResponseEntity.ok(
                new MessageResponse("If an account with that username exists, a password reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request.getToken(), request.getNewPassword());

        return ResponseEntity.ok(new MessageResponse("Your password has been reset successfully."));
    }

}