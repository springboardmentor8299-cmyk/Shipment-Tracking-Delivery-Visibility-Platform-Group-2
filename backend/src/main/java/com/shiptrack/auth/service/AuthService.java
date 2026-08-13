package com.shiptrack.auth.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

//import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shiptrack.activity.service.ActivityService;
import com.shiptrack.auth.dto.AuthResponse;
import com.shiptrack.auth.dto.GoogleTokenInfoResponse;
import com.shiptrack.auth.dto.Googleauthrequest;
import com.shiptrack.auth.dto.LoginRequest;
import com.shiptrack.auth.dto.RegisterRequest;
import com.shiptrack.auth.entity.PasswordResetToken;
import com.shiptrack.auth.entity.User;
import com.shiptrack.auth.repository.PasswordResetTokenRepository;
import com.shiptrack.auth.repository.UserRepository;
import com.shiptrack.auth.entity.Role;

@Service
public class AuthService {

    private static final int RESET_TOKEN_VALID_MINUTES = 30;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ActivityService activityService;
    private final GoogleTokenVerifierService googleTokenVerifierService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public AuthService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            ActivityService activityService,
            GoogleTokenVerifierService googleTokenVerifierService,
            PasswordResetTokenRepository passwordResetTokenRepository,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.activityService = activityService;
        this.googleTokenVerifierService = googleTokenVerifierService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
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
                .phoneNumber(request.getPhoneNumber())
                .role(Role.CUSTOMER) // by default role customer
                .build();

        userRepository.save(user);
        try {
            activityService.save(user.getUsername(), "USER_REGISTERED", "User registered: " + user.getUsername());
        } catch (Exception ignored) {
        }

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

        Optional<User> optionalUser = userRepository.findByUsername(request.getUsername());

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
                .name(user.getName()) // <-- VERY IMPORTANT
                .username(user.getUsername())
                .role(user.getRole())
                .message("Login Successful")
                .build();
    }

    public AuthResponse googleAuth(Googleauthrequest request) {

        GoogleTokenInfoResponse googleUser = googleTokenVerifierService.verify(request.getIdToken());

        if (googleUser == null) {
            throw new RuntimeException("Google sign-in could not be verified. Please try again.");
        }

        User user = userRepository.findByGoogleId(googleUser.getSub())
                .or(() -> linkExistingAccountByEmail(googleUser))
                .orElseGet(() -> createGoogleUser(googleUser));

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .username(user.getUsername())
                .role(user.getRole())
                .message("Login Successful")
                .build();
    }

    private Optional<User> linkExistingAccountByEmail(GoogleTokenInfoResponse googleUser) {
        return userRepository.findByUsername(googleUser.getEmail())
                .map(existing -> {
                    existing.setGoogleId(googleUser.getSub());
                    if (existing.getName() == null || existing.getName().isBlank()) {
                        existing.setName(googleUser.getName());
                    }
                    userRepository.save(existing);
                    try {
                        activityService.save(existing.getUsername(), "GOOGLE_ACCOUNT_LINKED",
                                "Linked Google sign-in to existing account: " + existing.getUsername());
                    } catch (Exception ignored) {
                    }
                    return existing;
                });
    }

    private User createGoogleUser(GoogleTokenInfoResponse googleUser) {
        byte[] randomBytes = new byte[24];
        secureRandom.nextBytes(randomBytes);
        String unusablePassword = Base64.getEncoder().encodeToString(randomBytes);

        User user = User.builder()
                .name(googleUser.getName())
                .username(googleUser.getEmail())
                .password(passwordEncoder.encode(unusablePassword))
                .role(Role.CUSTOMER) // matches register(): new sign-ups always start as CUSTOMER
                .googleId(googleUser.getSub())
                .build();

        userRepository.save(user);
        try {
            activityService.save(user.getUsername(), "USER_REGISTERED",
                    "User registered via Google: " + user.getUsername());
        } catch (Exception ignored) {
        }

        return user;
    }

    @Transactional
    public void forgotPassword(String username) {

        Optional<User> optionalUser = userRepository.findByUsername(username);

        if (optionalUser.isEmpty()) {
            return;
        }

        User user = optionalUser.get();

        passwordResetTokenRepository.invalidateAllActiveTokensForUser(user);

        String rawToken = generateSecureToken();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .tokenHash(hashToken(rawToken))
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(RESET_TOKEN_VALID_MINUTES))
                .used(false)
                .createdAt(LocalDateTime.now())
                .build();

        passwordResetTokenRepository.save(resetToken);

        String resetLink = frontendUrl + "/reset-password?token=" + rawToken;

        try {
            emailService.sendPasswordResetEmail(user.getUsername(), resetLink);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
        }

        try {
            activityService.save(user.getUsername(), "PASSWORD_RESET_REQUESTED",
                    "Password reset requested for: " + user.getUsername());
        } catch (Exception ignored) {
        }
    }

    // Reset Password
    @Transactional
    public void resetPassword(String rawToken, String newPassword) {

        if (rawToken == null || rawToken.isBlank()) {
            throw new RuntimeException("Reset token is required");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters long");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(hashToken(rawToken))
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset link"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("This reset link has already been used");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("This reset link has expired. Please request a new one");
        }

        User user = resetToken.getUser();

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        try {
            activityService.save(user.getUsername(), "PASSWORD_RESET_COMPLETED",
                    "Password reset completed for: " + user.getUsername());
        } catch (Exception ignored) {
        }
    }

    private String generateSecureToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Unable to process reset token");
        }
    }
}