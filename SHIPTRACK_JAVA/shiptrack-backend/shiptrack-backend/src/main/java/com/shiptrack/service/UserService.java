package com.shiptrack.service;
import java.util.List;
import java.util.UUID;
import com.shiptrack.dto.LoginRequest;
import com.shiptrack.dto.RegisterRequest;
import com.shiptrack.entity.Role;
import com.shiptrack.entity.User;
import com.shiptrack.exception.InvalidCredentialsException;
import com.shiptrack.exception.UserAlreadyExistsException;
import com.shiptrack.exception.UserNotFoundException;
import com.shiptrack.repository.DriverLocationRepository;
import com.shiptrack.repository.RoleRepository;
import com.shiptrack.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DriverLocationRepository driverLocationRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            DriverLocationRepository driverLocationRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.driverLocationRepository = driverLocationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(RegisterRequest request) {

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        if (userRepository.findByEmail(email).isPresent()) {

            throw new UserAlreadyExistsException(
                    "An account with this email already exists. Please log in.");
        }

        String requestedRole = request.getRole();
        String roleName =
                requestedRole == null || requestedRole.trim().isEmpty()
                        ? "ROLE_CUSTOMER"
                        : requestedRole.trim();

        Role role = roleRepository
                .findByName(roleName)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Role not found"));

        User user = new User();

        user.setFullName(
                request.getFullName().trim());

        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()));

        user.setPhone(
                request.getPhone());

        user.setRole(role);

        return userRepository.save(user);
    }

    public User login(LoginRequest request) {

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "You don't have an account. Please register first."));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new InvalidCredentialsException(
                    "Enter correct email or password.");
        }

        return user;
    }

    public User findByEmail(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found"));
    }

    @Transactional
    public User findOrCreateOauthUser(
            String email,
            String fullName,
            List<String> realmRoles) {

        String normalizedEmail =
                email == null ? null : email.trim().toLowerCase();

        if (normalizedEmail == null || normalizedEmail.isEmpty()) {
            throw new RuntimeException("Google ID token is missing an email claim.");
        }

        Role role = resolveOauthRole(realmRoles);

        return userRepository
                .findByEmail(normalizedEmail)
                .map(existing -> {
                    if (existing.getRole() == null) {
                        existing.setRole(role);
                        return userRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    User user = new User();
                    user.setFullName(
                            fullName == null || fullName.isBlank()
                                    ? normalizedEmail
                                    : fullName.trim());
                    user.setEmail(normalizedEmail);
                    user.setPassword(
                            passwordEncoder.encode(UUID.randomUUID().toString()));
                    user.setRole(role);
                    return userRepository.save(user);
                });
    }

    private Role resolveOauthRole(List<String> realmRoles) {

        if (realmRoles != null) {
            for (String realmRole : realmRoles) {
                if (realmRole == null || realmRole.isBlank()) {
                    continue;
                }
                String roleName = realmRole.trim();
                java.util.Optional<Role> role =
                        roleRepository.findByName(roleName);
                if (role.isPresent()) {
                    return role.get();
                }
            }
        }

        return roleRepository.findByName("ROLE_CUSTOMER")
                .orElseThrow(() ->
                        new RuntimeException(
                                "Role not found"));
    }

    public List<User> getAllUsers() {

        return userRepository.findAll();
    }

    public long getTotalUsers() {
        return userRepository.count();
    }

    public long getAdminUsers() {
        return userRepository.findAll()
                .stream()
                .filter(user ->
                        user.getRole()
                                .getName()
                                .equals("ROLE_ADMIN"))
                .count();
    }

    public long getCustomerUsers() {
        return userRepository.findAll()
                .stream()
                .filter(user ->
                        user.getRole()
                                .getName()
                                .equals("ROLE_CUSTOMER"))
                .count();
    }

    public long getSupportUsers() {
        return userRepository.findAll()
                .stream()
                .filter(user ->
                        user.getRole()
                                .getName()
                                .equals("ROLE_SUPPORT"))
                .count();
    }

    @Transactional
    public void deleteUser(Long id) {

        User user =
                userRepository.findById(id)
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "User not found"));

        if ("ROLE_ADMIN".equals(
                user.getRole().getName())) {

            throw new RuntimeException(
                    "Admin users cannot be deleted");
        }

        driverLocationRepository.deleteByDriver_Id(id);
        userRepository.delete(user);
    }

    public User updateUserRole(
            Long userId,
            String roleName) {

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new UserNotFoundException(
                                        "User not found"));

        Role role =
                roleRepository.findByName(roleName)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Role not found"));

        user.setRole(role);

        return userRepository.save(user);
    }

    public long countByRole(
            String roleName) {

        return userRepository.findAll()
                .stream()
                .filter(user ->
                        roleName.equals(
                                user.getRole()
                                        .getName()))
                .count();
    }
}
