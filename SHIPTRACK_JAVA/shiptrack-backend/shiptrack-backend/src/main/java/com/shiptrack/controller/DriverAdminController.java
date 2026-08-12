package com.shiptrack.controller;

import com.shiptrack.dto.NotificationDTO;
import com.shiptrack.dto.driver.DriverAdminResponse;
import com.shiptrack.dto.driver.DriverCreateRequest;
import com.shiptrack.dto.driver.DriverPerformanceResponse;
import com.shiptrack.dto.driver.DriverRouteHistoryResponse;
import com.shiptrack.dto.driver.DriverShipmentResponse;
import com.shiptrack.dto.driver.DriverUpdateRequest;
import com.shiptrack.dto.tracking.MapLocationResponse;
import com.shiptrack.dto.tracking.ShipmentMonitoringResponse;
import com.shiptrack.service.DeliveryMonitoringService;
import com.shiptrack.service.DriverManagementService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/drivers")
@PreAuthorize("hasRole('ADMIN')")
public class DriverAdminController {

    private final DriverManagementService driverManagementService;
    private final DeliveryMonitoringService deliveryMonitoringService;

    public DriverAdminController(
            DriverManagementService driverManagementService,
            DeliveryMonitoringService deliveryMonitoringService) {
        this.driverManagementService = driverManagementService;
        this.deliveryMonitoringService = deliveryMonitoringService;
    }

    @GetMapping
    public List<DriverAdminResponse> getDrivers(
            @RequestParam(required = false) String search) {

        return driverManagementService.getDrivers(search);
    }

    @GetMapping("/stats")
    public Map<String, Long> getDriverStats() {

        return driverManagementService.getDriverStats();
    }

    @PostMapping
    public DriverAdminResponse addDriver(
            @RequestBody DriverCreateRequest request) {

        return driverManagementService.addDriver(request);
    }

    @PutMapping("/{id}")
    public DriverAdminResponse updateDriver(
            @PathVariable Long id,
            @RequestBody DriverUpdateRequest request) {

        return driverManagementService.updateDriver(id, request);
    }

    @PutMapping("/{id}/active")
    public DriverAdminResponse setDriverActive(
            @PathVariable Long id,
            @RequestParam Boolean active) {

        driverManagementService.setDriverActive(id, active);

        return driverManagementService.getDrivers(null).stream()
                .filter(driver -> driver.getDriverId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Driver not found."));
    }

    @DeleteMapping("/{id}")
    public String deleteDriver(
            @PathVariable Long id) {

        driverManagementService.deleteDriver(id);

        return "Driver deleted successfully";
    }

    @GetMapping("/{id}/performance")
    public DriverPerformanceResponse getDriverPerformance(
            @PathVariable Long id) {

        return driverManagementService.getDriverPerformance(id);
    }

    @GetMapping("/{id}/shipments")
    public List<DriverShipmentResponse> getDriverShipments(
            @PathVariable Long id) {

        return driverManagementService.getDriverShipments(id);
    }

    @GetMapping("/{id}/route-history")
    public List<DriverRouteHistoryResponse> getDriverRouteHistory(
            @PathVariable Long id) {

        return driverManagementService.getDriverRouteHistory(id);
    }

    @GetMapping("/locations")
    public List<MapLocationResponse> getDriverLocations() {

        return driverManagementService.getDriverLocations();
    }

    @GetMapping("/shipments/live-status")
    public List<ShipmentMonitoringResponse> getLiveShipmentStatus() {

        return deliveryMonitoringService.getAllShipmentMonitoring();
    }

    @GetMapping("/notifications")
    public List<NotificationDTO> getDriverNotifications() {

        return driverManagementService.getDriverNotifications();
    }
}
