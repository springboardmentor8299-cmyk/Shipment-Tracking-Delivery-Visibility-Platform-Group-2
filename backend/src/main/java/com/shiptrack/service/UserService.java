package com.shiptrack.service;

import com.shiptrack.dto.AuthResponse;
import com.shiptrack.dto.LoginRequest;
import com.shiptrack.dto.RegisterRequest;
import com.shiptrack.entity.User;
import com.shiptrack.exception.ApiException;
import com.shiptrack.exception.DuplicateResourceException;
import com.shiptrack.repository.UserRepository;
import com.shiptrack.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;

        public AuthResponse register(RegisterRequest request) {

                // if (userRepository.existsByEmail(request.getEmail())) {
                // return AuthResponse.builder()
                // .message("Email already exists!")
                // .build();
                // }
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new DuplicateResourceException("Email already exists.");
                }

                User user = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .phone(request.getPhone())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role("USER")
                                .build();

                userRepository.save(user);

                // return AuthResponse.builder()
                // .message("User Registered Successfully")
                // .build();
                return AuthResponse.builder()
                                .message("User Registered Successfully")
                                .role(user.getRole())
                                .name(user.getName())
                                .build();
        }

        public AuthResponse login(LoginRequest request) {

                User user = userRepository.findByEmail(request.getEmail())
                                .orElse(null);


                if (user == null) {
                        throw new ApiException("Invalid email or password.");
                }


                if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        throw new ApiException("Invalid email or password.");
                }

                String token = jwtService.generateToken(user.getEmail());


                return AuthResponse.builder()
                                .message("Login Successful")
                                .token(token)
                                .role(user.getRole())
                                .name(user.getName())
                                .build();
        }
}