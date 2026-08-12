package com.shiptrack.controller;

import com.shiptrack.dto.ActivityResponse;
import com.shiptrack.service.DashboardService;
import com.shiptrack.service.ShipmentService;
import com.shiptrack.dto.tracking.LiveDeliveryMonitorResponse;
import com.shiptrack.dto.tracking.ShipmentMonitoringResponse;
import com.shiptrack.entity.User;
import com.shiptrack.service.UserService;
import org.springframework.web.bind.annotation.*;
import com.shiptrack.dto.SystemHealthResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ShipmentService shipmentService;
    private final DashboardService dashboardService;
    private final UserService userService;

    public DashboardController(
            ShipmentService shipmentService,
            DashboardService dashboardService,
            UserService userService) {

        this.shipmentService = shipmentService;
        this.dashboardService = dashboardService;
        this.userService = userService;
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {

        Map<String, Long> stats = new HashMap<>();

        stats.put(
                "totalShipments",
                shipmentService.getTotalShipments());

        stats.put(
                "delivered",
                shipmentService.getDeliveredShipments());

        stats.put(
                "inTransit",
                shipmentService.getInTransitShipments());

        stats.put(
                "pending",
                shipmentService.getPendingShipments());

        return stats;
    }

    @GetMapping("/recent-activities")
    public List<ActivityResponse> getRecentActivities() {

        return dashboardService.getRecentActivities();

    }

    @GetMapping("/system-health")
    @PreAuthorize("hasRole('ADMIN')")
    public List<SystemHealthResponse> getSystemHealth() {

        return dashboardService.getSystemHealth();

    }

    @GetMapping("/live-monitoring")
    public List<LiveDeliveryMonitorResponse> getLiveMonitoring() {
        return dashboardService.getLiveMonitoring();
    }

    @GetMapping("/shipment-monitoring")
    public List<ShipmentMonitoringResponse> getShipmentMonitoring() {
        return dashboardService.getShipmentMonitoring();
    }

    @GetMapping("/shipment-monitoring/me")
    public List<ShipmentMonitoringResponse> getMyShipmentMonitoring(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        return dashboardService.getShipmentMonitoringForUser(user);
    }

}

