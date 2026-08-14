package com.shiptrack.service;

import com.shiptrack.dto.AuthResponse;
import com.shiptrack.dto.CreateEmployeeRequest;
import com.shiptrack.dto.CreateOperatorRequest;
import com.shiptrack.dto.LoginRequest;
import com.shiptrack.dto.RegisterRequest;
import com.shiptrack.dto.UserResponse;
import com.shiptrack.entity.User;
import com.shiptrack.exception.ApiException;
import com.shiptrack.exception.DuplicateResourceException;
import com.shiptrack.exception.ForbiddenException;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.UserRepository;
import com.shiptrack.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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
                                .email(user.getEmail())
                                .id(user.getId())
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
                                .email(user.getEmail())
                                .id(user.getId())
                                .build();
        }

        // ==================== Delivery Operator management (ADMIN only) ====================

        private void requireAdmin(String currentUserEmail) {
                User currentUser = userRepository.findByEmail(currentUserEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
                if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
                        throw new ForbiddenException("Access denied. Admins only.");
                }
        }

        @Transactional
        public UserResponse createDeliveryOperator(CreateOperatorRequest request, String currentUserEmail) {

                requireAdmin(currentUserEmail);

                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new DuplicateResourceException("Email already exists.");
                }

                User operator = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .phone(request.getPhone())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role("DELIVERY_OPERATOR")
                                .build();

                operator = userRepository.save(operator);

                return toUserResponse(operator);
        }

        @Transactional(readOnly = true)
        public List<UserResponse> listDeliveryOperators(String currentUserEmail) {

                requireAdmin(currentUserEmail);

                return userRepository.findAll().stream()
                                .filter(u -> "DELIVERY_OPERATOR".equalsIgnoreCase(u.getRole()))
                                .map(this::toUserResponse)
                                .collect(Collectors.toList());
        }

        @Transactional
        public void deleteDeliveryOperator(Long id, String currentUserEmail) {

                requireAdmin(currentUserEmail);

                User operator = userRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

                if (!"DELIVERY_OPERATOR".equalsIgnoreCase(operator.getRole())) {
                        throw new ForbiddenException("Only delivery operator accounts can be deleted here.");
                }

                userRepository.delete(operator);
        }

        private UserResponse toUserResponse(User user) {
                return UserResponse.builder()
                                .id(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .phone(user.getPhone())
                                .role(user.getRole())
                                .createdAt(user.getCreatedAt())
                                .build();
        }

        // ==================== Employee management (ADMIN only) ====================

        private static final List<String> EMPLOYEE_ROLES = List.of(
                        "ADMIN", "SUPPORT_ASSISTANT", "DELIVERY_OPERATOR");

        @Transactional(readOnly = true)
        public List<UserResponse> listEmployees(String currentUserEmail) {

                requireAdmin(currentUserEmail);

                return userRepository.findAll().stream()
                                .filter(u -> !"USER".equalsIgnoreCase(u.getRole()))
                                .map(this::toUserResponse)
                                .collect(Collectors.toList());
        }

        @Transactional
        public UserResponse createEmployee(CreateEmployeeRequest request, String currentUserEmail) {

                requireAdmin(currentUserEmail);

                String role = request.getRole().trim().toUpperCase();
                if (!EMPLOYEE_ROLES.contains(role)) {
                        throw new IllegalArgumentException("Role must be one of: ADMIN, SUPPORT_ASSISTANT, DELIVERY_OPERATOR.");
                }

                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new DuplicateResourceException("Email already exists.");
                }

                User employee = User.builder()
                                .name(request.getName())
                                .email(request.getEmail())
                                .phone(request.getPhone())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(role)
                                .build();

                employee = userRepository.save(employee);

                return toUserResponse(employee);
        }

        @Transactional
        public void deleteEmployee(Long id, String currentUserEmail) {

                User currentUser = userRepository.findByEmail(currentUserEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

                if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
                        throw new ForbiddenException("Access denied. Admins only.");
                }

                if (currentUser.getId().equals(id)) {
                        throw new IllegalArgumentException("You cannot delete your own account.");
                }

                User employee = userRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

                if ("USER".equalsIgnoreCase(employee.getRole())) {
                        throw new ForbiddenException("Only employee accounts can be deleted here.");
                }

                userRepository.delete(employee);
        }
}