package com.shiptrack.driver.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.shiptrack.admin.shipment.dto.StatusUpdateRequest;
import com.shiptrack.driver.dto.ChangePasswordRequest;
import com.shiptrack.driver.dto.DriverResponse;
import com.shiptrack.driver.dto.DriverShipmentResponse;
import com.shiptrack.driver.dto.DriverStatusUpdateRequest;
import com.shiptrack.driver.service.DriverService;

// Self-service portal for a logged-in DRIVER -- everything here is scoped
// to the calling driver's own account/shipment, unlike DriverController
// (under /api/operator) which lets an operator manage *any* driver.
@RestController
@RequestMapping("/api/driver")
public class DriverPortalController {

    private final DriverService driverService;

    public DriverPortalController(DriverService driverService) {
        this.driverService = driverService;
    }

    @GetMapping("/dashboard")
    public DriverResponse getDashboard(Authentication authentication) {
        return driverService.getMyProfile(authentication.getName());
    }

    @PutMapping("/status")
    public DriverResponse updateStatus(
            @RequestBody DriverStatusUpdateRequest request,
            Authentication authentication) {

        return driverService.updateMyStatus(authentication.getName(), request);
    }

    // A driver can now hold several active shipments at once (up to their
    // vehicle's capacity), so this returns all of them rather than one.
    @GetMapping("/shipments")
    public List<DriverShipmentResponse> getActiveShipments(Authentication authentication) {
        return driverService.getMyActiveShipments(authentication.getName());
    }

    @PutMapping("/shipments/{trackingId}/status")
    public DriverShipmentResponse updateShipmentStatus(
            @PathVariable String trackingId,
            @RequestBody StatusUpdateRequest request,
            Authentication authentication) {

        return driverService.updateMyShipmentStatus(authentication.getName(), trackingId, request);
    }

    @GetMapping("/history")
    public List<DriverShipmentResponse> getHistory(Authentication authentication) {
        return driverService.getMyHistory(authentication.getName());
    }

    @GetMapping("/profile")
    public DriverResponse getProfile(Authentication authentication) {
        return driverService.getMyProfile(authentication.getName());
    }

    @PutMapping("/profile/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        driverService.changeMyPassword(authentication.getName(), request);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}