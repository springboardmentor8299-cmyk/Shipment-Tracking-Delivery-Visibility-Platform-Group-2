package com.shiptrackpro.service;

import com.shiptrackpro.dto.AuthDTO;
import com.shiptrackpro.entity.Role;
import com.shiptrackpro.entity.User;
import com.shiptrackpro.entity.UserActivityLog;
import com.shiptrackpro.repository.UserActivityLogRepository;
import com.shiptrackpro.repository.UserRepository;
import com.shiptrackpro.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserActivityLogRepository activityLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Transactional
    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setLastLogin(LocalDateTime.now().format(FORMATTER));
        userRepository.save(user);

        // Record activity log
        activityLogRepository.save(new UserActivityLog(
                "act-" + UUID.randomUUID().toString().substring(0, 8),
                user.getId(),
                user.getName(),
                user.getRole(),
                "User signed in successfully",
                LocalDateTime.now().format(FORMATTER),
                "127.0.0.1"
        ));

        return new AuthDTO.AuthResponse(
                jwt,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().getDisplayName(),
                user.getCompanyName(),
                user.getAvatarUrl()
        );
    }

    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = new User();
        user.setId("usr-" + UUID.randomUUID().toString().substring(0, 8));
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.fromDisplayName(request.getRole()));
        user.setCompanyName(request.getCompanyName());
        user.setLastLogin(LocalDateTime.now().format(FORMATTER));
        user.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150");

        userRepository.save(user);

        String jwt = tokenProvider.generateTokenFromUsername(user.getEmail());

        return new AuthDTO.AuthResponse(
                jwt,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().getDisplayName(),
                user.getCompanyName(),
                user.getAvatarUrl()
        );
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public User updateUser(String id, User updated) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if (updated.getName() != null) user.setName(updated.getName());
        if (updated.getCompanyName() != null) user.setCompanyName(updated.getCompanyName());
        if (updated.getPhoneNumber() != null) user.setPhoneNumber(updated.getPhoneNumber());
        if (updated.getRole() != null) user.setRole(updated.getRole());
        if (updated.getAccountStatus() != null) user.setAccountStatus(updated.getAccountStatus());

        return userRepository.save(user);
    }
}
