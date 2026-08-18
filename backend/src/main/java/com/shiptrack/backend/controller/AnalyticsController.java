package com.shiptrack.backend.controller;

import com.shiptrack.backend.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * GET /api/analytics/customer/{userId}
     */
    @GetMapping("/customer/{userId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMINISTRATOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getCustomerAnalytics(@PathVariable Long userId) {
        return ResponseEntity.ok(analyticsService.getCustomerAnalytics(userId));
    }

    /**
     * GET /api/analytics/business/{businessId}
     */
    @GetMapping("/business/{businessId}")
    @PreAuthorize("hasAnyRole('BUSINESS_CLIENT', 'ADMINISTRATOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getBusinessAnalytics(@PathVariable Long businessId) {
        return ResponseEntity.ok(analyticsService.getBusinessAnalytics(businessId));
    }

    /**
     * GET /api/analytics/operator/{operatorId}
     */
    @GetMapping("/operator/{operatorId}")
    @PreAuthorize("hasAnyRole('LOGISTICS_OPERATOR', 'ADMINISTRATOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getOperatorAnalytics(@PathVariable Long operatorId) {
        return ResponseEntity.ok(analyticsService.getOperatorAnalytics(operatorId));
    }

    /**
     * GET /api/analytics/support
     */
    @GetMapping("/support")
    @PreAuthorize("hasAnyRole('SUPPORT_AGENT', 'ADMINISTRATOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getSupportAnalytics() {
        return ResponseEntity.ok(analyticsService.getSupportAnalytics());
    }

    /**
     * GET /api/analytics/admin
     */
    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminAnalytics() {
        return ResponseEntity.ok(analyticsService.getAdminAnalytics());
    }
}
