package com.shiptrack.backend.service;

import com.shiptrack.backend.dto.RegistrationRequest;
import com.shiptrack.backend.entity.User;
import com.shiptrack.backend.repository.UserRepository;
import com.shiptrack.backend.security.JwtService;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // ==========================
    // REGISTER
    // ==========================

    public User register(RegistrationRequest request) {

        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Username is required");
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new RuntimeException("Email is required");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("Password is required");
        }

        String username = request.getName().trim();

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();

        user.setUsername(username);

        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        if (request.getRole() != null &&
                !request.getRole().isBlank()) {

            user.setRole(
                    request.getRole()
                            .trim()
                            .toUpperCase()
            );

        } else {

            user.setRole("CUSTOMER");
        }

        return userRepository.save(user);
    }

    // ==========================
    // LOGIN
    // ==========================

    public String login(String email, String password) {

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }

        User user = userRepository.findByEmail(
                        email.trim().toLowerCase())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String storedPassword = user.getPassword();
        boolean passwordMatches = false;

        if (storedPassword != null && storedPassword.startsWith("$2")) {
            try {
                passwordMatches = passwordEncoder.matches(password, storedPassword);
            } catch (Exception ignored) {
                passwordMatches = false;
            }
        } else {
            passwordMatches = password != null && password.equals(storedPassword);
        }

        if (!passwordMatches) {
            throw new RuntimeException("Invalid Password");
        }

        return jwtService.generateToken(
                user.getEmail(),
                user.getRole(),
                user.getUsername()
        );
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ==========================
    // FORGOT / RESET PASSWORD
    // ==========================

    public String resetPassword(String identifier, String newPassword) {
        if (identifier == null || identifier.isBlank()) {
            throw new RuntimeException("Email address or username is required");
        }

        if (newPassword == null || newPassword.isBlank()) {
            throw new RuntimeException("New password is required");
        }

        if (newPassword.trim().length() < 4) {
            throw new RuntimeException("Password must be at least 4 characters long");
        }

        String cleanIdentifier = identifier.trim().toLowerCase();

        User user = userRepository.findByEmail(cleanIdentifier)
                .or(() -> userRepository.findByUsername(identifier.trim()))
                .orElseThrow(() -> new RuntimeException("No user account found with email or username: " + identifier));

        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);

        return "Password reset successfully. You can now login with your new password.";
    }

}