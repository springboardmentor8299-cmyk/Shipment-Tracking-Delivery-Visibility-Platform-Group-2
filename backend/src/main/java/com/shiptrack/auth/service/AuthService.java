package com.shiptrack.auth.service;

import java.util.Optional;

//import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.shiptrack.activity.service.ActivityService;
import com.shiptrack.auth.dto.AuthResponse;
import com.shiptrack.auth.dto.LoginRequest;
import com.shiptrack.auth.dto.RegisterRequest;
import com.shiptrack.auth.entity.User;
import com.shiptrack.auth.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ActivityService activityService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       ActivityService activityService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.activityService = activityService;
    }

    // Register

    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        userRepository.save(user);
        try {
            activityService.save(user.getUsername(), "USER_REGISTERED", "User registered: " + user.getUsername());
        } catch (Exception ignored) {}

        return AuthResponse.builder()
            .message("User Registered Successfully")
            .name(user.getName())
            .token(null)
            .username(user.getUsername())
            .role(user.getRole())
            .build();
    }

    // Login

    public AuthResponse login(LoginRequest request) {

        Optional<User> optionalUser =
                userRepository.findByUsername(request.getUsername());

        if (optionalUser.isEmpty()) {
            throw new RuntimeException("Invalid Username");
        }

        User user = optionalUser.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid Password");
        }

     
        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())          // <-- VERY IMPORTANT
                .username(user.getUsername())
                .role(user.getRole())
                .message("Login Successful")
                .build();
    }
}