package com.shiptrack.controller;

import com.shiptrack.entity.User;
import com.shiptrack.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {

        return userService.getAllUsers();
    }

    @GetMapping("/stats")
    public Map<String, Long> getUserStats() {

        return Map.of(
                "totalUsers",
                userService.getTotalUsers(),

                "adminUsers",
                userService.getAdminUsers(),

                "supportUsers",
                userService.getSupportUsers(),

                "customerUsers",
                userService.getCustomerUsers()
        );
    }

    @DeleteMapping("/{id}")
    public String deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);

        return "User deleted successfully";
    }

    @PutMapping("/{id}/role")
    public User updateUserRole(
            @PathVariable Long id,
            @RequestParam String role) {

        return userService.updateUserRole(
                id,
                role);
    }

    @GetMapping("/analytics")
    public Map<String, Long> getUserAnalytics() {

        return Map.of(
                "ROLE_ADMIN",
                userService.countByRole("ROLE_ADMIN"),

                "ROLE_BUSINESS",
                userService.countByRole("ROLE_BUSINESS"),

                "ROLE_CUSTOMER",
                userService.countByRole("ROLE_CUSTOMER"),

                "ROLE_OPERATOR",
                userService.countByRole("ROLE_OPERATOR"),

                "ROLE_SUPPORT",
                userService.countByRole("ROLE_SUPPORT")
        );
    }
}
