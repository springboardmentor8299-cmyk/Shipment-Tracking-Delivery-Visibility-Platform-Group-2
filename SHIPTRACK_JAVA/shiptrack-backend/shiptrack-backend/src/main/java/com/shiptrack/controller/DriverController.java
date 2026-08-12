package com.shiptrack.controller;

import com.shiptrack.dto.driver.DriverDashboardOverviewResponse;
import com.shiptrack.dto.driver.DriverRouteHistoryResponse;
import com.shiptrack.dto.driver.DriverShipmentResponse;
import com.shiptrack.dto.driver.DriverStatusUpdateRequest;
import com.shiptrack.service.DriverService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/driver")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @GetMapping("/overview")
    @PreAuthorize("hasRole('DRIVER')")
    public DriverDashboardOverviewResponse getOverview() {

        return driverService.getOverview();
    }

    @GetMapping("/shipments")
    @PreAuthorize("hasRole('DRIVER')")
    public List<DriverShipmentResponse> getAssignedShipments(
            @RequestParam(required = false) String search) {

        return driverService.getAssignedShipments(search);
    }

    @GetMapping("/shipments/delivered")
    @PreAuthorize("hasRole('DRIVER')")
    public List<DriverShipmentResponse> getDeliveredShipments() {

        return driverService.getDeliveredShipments();
    }

    @GetMapping("/shipments/{id}")
    @PreAuthorize("hasRole('DRIVER')")
    public DriverShipmentResponse getShipmentDetails(
            @PathVariable Long id) {

        return driverService.getShipmentDetails(id);
    }

    @PutMapping("/shipments/{id}/status")
    @PreAuthorize("hasRole('DRIVER')")
    public DriverShipmentResponse updateShipmentStatus(
            @PathVariable Long id,
            @RequestBody DriverStatusUpdateRequest request) {

        return driverService.updateShipmentStatus(id, request);
    }

    @GetMapping("/route-history")
    @PreAuthorize("hasRole('DRIVER')")
    public List<DriverRouteHistoryResponse> getRouteHistory() {

        return driverService.getRouteHistory();
    }
}
