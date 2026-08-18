package com.shiptrack.backend.controller;

import com.shiptrack.backend.entity.User;
import com.shiptrack.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/customers")
    public List<User> getCustomers() {
        return userRepository.findAll().stream()
                .filter(u -> "CUSTOMER".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toList());
    }

    @GetMapping({"/drivers", "/operators"})
    public List<User> getDriversAndOperators() {
        return userRepository.findAll().stream()
                .filter(u -> "DRIVER".equalsIgnoreCase(u.getRole()) 
                        || "LOGISTICS_OPERATOR".equalsIgnoreCase(u.getRole())
                        || "OPERATOR".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toList());
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User newUser) {
        if (newUser.getUsername() == null || newUser.getUsername().isBlank()) {
            return ResponseEntity.badRequest().body("Username is required");
        }
        if (newUser.getEmail() == null || newUser.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        String cleanEmail = newUser.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        newUser.setEmail(cleanEmail);
        newUser.setUsername(newUser.getUsername().trim());
        if (newUser.getPassword() != null && !newUser.getPassword().isBlank()) {
            newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        } else {
            newUser.setPassword(passwordEncoder.encode("password123"));
        }
        if (newUser.getRole() == null || newUser.getRole().isBlank()) {
            newUser.setRole("CUSTOMER");
        } else {
            newUser.setRole(newUser.getRole().trim().toUpperCase());
        }
        User saved = userRepository.save(newUser);
        return ResponseEntity.ok(saved);
    }
}
