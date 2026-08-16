package com.shiptrackpro.controller;

import com.shiptrackpro.dto.AiDTO;
import com.shiptrackpro.dto.AnalyticsDTO;
import com.shiptrackpro.entity.*;
import com.shiptrackpro.repository.UserActivityLogRepository;
import com.shiptrackpro.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CoreControllers {

    @RestController
    @RequestMapping("/api/notifications")
    public static class NotificationController {
        @Autowired
        private NotificationService notificationService;

        @GetMapping
        public ResponseEntity<List<Notification>> getAllNotifications() {
            return ResponseEntity.ok(notificationService.getAllNotifications());
        }

        @PostMapping("/read")
        public ResponseEntity<?> markRead(@RequestBody(required = false) Map<String, String> body) {
            String id = body != null ? body.get("id") : null;
            if (id != null) {
                return ResponseEntity.ok(notificationService.markAsRead(id));
            }
            return ResponseEntity.ok(Map.of("success", true));
        }
    }

    @RestController
    @RequestMapping("/api/analytics")
    public static class AnalyticsController {
        @Autowired
        private AnalyticsService analyticsService;

        @GetMapping
        public ResponseEntity<AnalyticsDTO.SummaryResponse> getAnalytics() {
            return ResponseEntity.ok(analyticsService.getAnalyticsSummary());
        }
    }

    @RestController
    @RequestMapping("/api/activity")
    public static class ActivityController {
        @Autowired
        private UserActivityLogRepository activityLogRepository;

        @GetMapping
        public ResponseEntity<List<UserActivityLog>> getActivityLogs() {
            return ResponseEntity.ok(activityLogRepository.findAllByOrderByTimestampDesc());
        }

        @PostMapping
        public ResponseEntity<UserActivityLog> createActivity(@RequestBody UserActivityLog log) {
            if (log.getId() == null) log.setId("act-" + UUID.randomUUID().toString().substring(0, 8));
            return ResponseEntity.ok(activityLogRepository.save(log));
        }
    }

    @RestController
    @RequestMapping("/api/ai")
    public static class AiController {
        @Autowired
        private EtaService etaService;

        @Autowired
        private AiService aiService;

        @PostMapping("/predict-eta")
        public ResponseEntity<AiDTO.PredictEtaResponse> predictEta(@RequestBody AiDTO.PredictEtaRequest request) {
            return ResponseEntity.ok(etaService.calculateDynamicEta(request));
        }

        @PostMapping("/assistant")
        public ResponseEntity<AiDTO.AssistantResponse> assistant(@RequestBody AiDTO.AssistantRequest request) {
            return ResponseEntity.ok(aiService.processChatPrompt(request));
        }
    }

    @RestController
    @RequestMapping("/api/admin")
    public static class AdminController {
        @Autowired
        private AdminService adminService;

        @GetMapping("/dashboard")
        public ResponseEntity<Map<String, Object>> getAdminDashboard() {
            Map<String, Object> data = new HashMap<>();
            data.put("escalations", adminService.getAllEscalations());
            data.put("businessApprovals", adminService.getAllBusinessApprovals());
            data.put("platformSettings", adminService.getPlatformSettings());
            data.put("auditLogs", adminService.getAuditLogs());
            return ResponseEntity.ok(data);
        }

        @GetMapping("/escalations")
        public ResponseEntity<List<Escalation>> getEscalations() {
            return ResponseEntity.ok(adminService.getAllEscalations());
        }

        @PutMapping("/escalations/{id}/resolve")
        public ResponseEntity<Escalation> resolveEscalation(@PathVariable String id, @RequestBody Map<String, String> body) {
            String resolution = body.getOrDefault("resolution", "Resolved by Administrator");
            String resolvedBy = body.getOrDefault("resolvedBy", "Admin");
            return ResponseEntity.ok(adminService.resolveEscalation(id, resolution, resolvedBy));
        }

        @GetMapping("/business-approvals")
        public ResponseEntity<List<BusinessApproval>> getBusinessApprovals() {
            return ResponseEntity.ok(adminService.getAllBusinessApprovals());
        }

        @PutMapping("/business-approvals/{id}/status")
        public ResponseEntity<BusinessApproval> updateBusinessStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
            String status = body.getOrDefault("status", "Approved");
            return ResponseEntity.ok(adminService.updateBusinessApprovalStatus(id, status));
        }

        @GetMapping("/audit-logs")
        public ResponseEntity<List<AuditLog>> getAuditLogs() {
            return ResponseEntity.ok(adminService.getAuditLogs());
        }

        @PostMapping("/audit-logs")
        public ResponseEntity<AuditLog> createAuditLog(@RequestBody AuditLog log) {
            return ResponseEntity.ok(adminService.createAuditLog(log));
        }

        @GetMapping("/settings")
        public ResponseEntity<PlatformSetting> getSettings() {
            return ResponseEntity.ok(adminService.getPlatformSettings());
        }

        @PutMapping("/settings")
        public ResponseEntity<PlatformSetting> updateSettings(@RequestBody PlatformSetting settings) {
            return ResponseEntity.ok(adminService.updatePlatformSettings(settings));
        }

        @PutMapping("/users/{id}/role")
        public ResponseEntity<User> updateUserRole(@PathVariable String id, @RequestBody Map<String, String> body) {
            String role = body.getOrDefault("role", "Customer");
            return ResponseEntity.ok(adminService.updateUserRole(id, role));
        }
    }
}
