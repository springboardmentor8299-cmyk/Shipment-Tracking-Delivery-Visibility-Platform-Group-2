package com.shiptrack.admin.notification.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shiptrack.admin.notification.dto.BroadcastNotificationRequest;
import com.shiptrack.admin.notification.dto.BroadcastNotificationResponse;
import com.shiptrack.admin.notification.dto.NotificationRecipientOptionsResponse;
import com.shiptrack.admin.notification.service.AdminNotificationService;

// Sits under /api/admin/**, so SecurityConfig already restricts this to
// ADMIN — no extra role check needed here.
@RestController
@RequestMapping("/api/admin/notifications")
public class AdminNotificationController {

    private final AdminNotificationService adminNotificationService;

    public AdminNotificationController(AdminNotificationService adminNotificationService) {
        this.adminNotificationService = adminNotificationService;
    }

    // Feeds the recipient pickers — per-customer tracking IDs, and named
    // business clients / logistics operators / support agents.
    @GetMapping("/recipients")
    public ResponseEntity<NotificationRecipientOptionsResponse> getRecipientOptions() {
        return ResponseEntity.ok(adminNotificationService.getRecipientOptions());
    }

    @PostMapping("/broadcast")
    public ResponseEntity<BroadcastNotificationResponse> broadcast(
            @RequestBody BroadcastNotificationRequest request,
            Authentication authentication) {

        String sentBy = authentication != null ? authentication.getName() : "unknown";

        return ResponseEntity.ok(adminNotificationService.broadcast(request, sentBy));
    }

}
