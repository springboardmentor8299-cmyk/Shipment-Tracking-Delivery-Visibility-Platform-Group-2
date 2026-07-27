package com.shiptrack.admin;

import com.shiptrack.admin.dto.CreateUserRequest;
import com.shiptrack.user.User;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.shiptrack.admin.dto.DashboardStatsResponse;
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<User> createStaff(
            @RequestBody CreateUserRequest request) {

        return ResponseEntity.ok(
                adminService.createStaff(request)
        );
    }
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<List<User>> getAllUsers() {

        return ResponseEntity.ok(
                adminService.getAllUsers()
        );

    }
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {

        return ResponseEntity.ok(
                adminService.getDashboardStats()
        );

    }
}