package com.shiptrack.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shiptrack.backend.entity.Shipment;
import com.shiptrack.backend.entity.User;
import com.shiptrack.backend.repository.UserRepository;
import com.shiptrack.backend.service.GeocodingService;
import com.shiptrack.backend.service.ShipmentService;

@RestController
@RequestMapping("/api/shipments")
@CrossOrigin(origins = "http://localhost:5173")
public class ShipmentController {

    private final ShipmentService shipmentService;
    private final UserRepository userRepository;
    private final GeocodingService geocodingService;

    public ShipmentController(ShipmentService shipmentService, UserRepository userRepository, GeocodingService geocodingService) {
        this.shipmentService = shipmentService;
        this.userRepository = userRepository;
        this.geocodingService = geocodingService;
    }

    /**
     * Endpoint 1: GET /api/shipments
     */
    @GetMapping
    public List<Shipment> getShipments(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String role) {

        Long targetUserId = resolveUserId(userId, username, email);
        String userRole = resolveRole(role, targetUserId, email);

        System.out.println("[Endpoint Log] GET /api/shipments -> authenticatedUserId=" + targetUserId + ", email=" + email + ", role=" + userRole);

        return shipmentService.getShipmentsForUser(targetUserId, email, username, userRole);
    }

    /**
     * Endpoint 2: GET /api/shipments/my
     */
    @GetMapping("/my")
    public List<Shipment> getMyShipments(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username) {

        Long targetUserId = resolveUserId(userId, username, email);

        System.out.println("[Endpoint Log] GET /api/shipments/my -> authenticatedUserId=" + targetUserId + ", email=" + email);

        return shipmentService.getShipmentsForUser(targetUserId, email, username, "CUSTOMER");
    }

    /**
     * Endpoint 3: POST /api/shipments
     * Creates new shipment with geocoded coordinates
     */
    @PostMapping
    public Shipment createShipment(
            @RequestBody Shipment shipment,
            @RequestParam(required = false) Long creatorUserId) {

        if (shipment.getCreatedByUserId() == null && creatorUserId != null) {
            shipment.setCreatedByUserId(creatorUserId);
        }

        // Automatic Real Geocoding for Pickup & Delivery Addresses
        if (shipment.getDestLatitude() == null || shipment.getDestLongitude() == null) {
            double[] destCoords = geocodingService.geocodeAddress(shipment.getDeliveryAddress());
            shipment.setDestLatitude(destCoords[0]);
            shipment.setDestLongitude(destCoords[1]);
        }

        if (shipment.getPickupLatitude() == null || shipment.getPickupLongitude() == null) {
            String pickupStr = shipment.getPickupAddress() != null ? shipment.getPickupAddress() : "Central Dispatch Warehouse, Delhi";
            shipment.setPickupAddress(pickupStr);
            double[] pickupCoords = geocodingService.geocodeAddress(pickupStr);
            shipment.setPickupLatitude(pickupCoords[0]);
            shipment.setPickupLongitude(pickupCoords[1]);
        }

        if (shipment.getLatitude() == null || shipment.getLongitude() == null) {
            double currentLat = shipment.getPickupLatitude() + (shipment.getDestLatitude() - shipment.getPickupLatitude()) * 0.4;
            double currentLng = shipment.getPickupLongitude() + (shipment.getDestLongitude() - shipment.getPickupLongitude()) * 0.4;
            shipment.setLatitude(currentLat);
            shipment.setLongitude(currentLng);
        }

        System.out.println("[Endpoint Log] POST /api/shipments -> trackingNumber=" + shipment.getTrackingNumber()
                + ", destCoords=[" + shipment.getDestLatitude() + ", " + shipment.getDestLongitude() + "]");

        return shipmentService.createShipment(shipment);
    }

    /**
     * Endpoint 4: GET /api/shipments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getShipmentById(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String role) {

        Long targetUserId = resolveUserId(userId, username, email);
        String userRole = resolveRole(role, targetUserId, email);

        Shipment shipment = shipmentService.getShipmentById(id);

        if (!shipmentService.canUserAccessShipment(shipment, targetUserId, userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("403 Forbidden: You do not have permission to access this shipment.");
        }

        return ResponseEntity.ok(shipment);
    }

    /**
     * Endpoint 5: GET /api/shipments/track/{trackingId}
     */
    @GetMapping("/track/{trackingId}")
    public ResponseEntity<?> getShipmentByTrackingId(
            @PathVariable String trackingId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String role) {

        Long targetUserId = resolveUserId(userId, username, email);
        String userRole = resolveRole(role, targetUserId, email);

        Optional<Shipment> shipmentOpt = shipmentService.getShipmentByTrackingNumber(trackingId);
        if (shipmentOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Shipment not found.");
        }

        Shipment shipment = shipmentOpt.get();

        if (!shipmentService.canUserAccessShipment(shipment, targetUserId, userRole)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("403 Forbidden: You do not have permission to access this shipment.");
        }

        return ResponseEntity.ok(shipment);
    }

    @PutMapping("/{id}")
    public Shipment updateShipment(
            @PathVariable Long id,
            @RequestBody Shipment shipment) {
        return shipmentService.updateShipment(id, shipment);
    }

    @PatchMapping("/{id}/status")
    public Shipment updateShipmentStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload) {
        String status = payload.get("status");
        Shipment shipment = shipmentService.getShipmentById(id);
        shipment.setStatus(status);
        return shipmentService.updateShipment(id, shipment);
    }

    @DeleteMapping("/{id}")
    public String deleteShipment(@PathVariable Long id) {
        shipmentService.deleteShipment(id);
        return "Shipment deleted successfully";
    }

    private Long resolveUserId(Long userId, String username, String email) {
        if (userId != null) return userId;
        if (email != null && !email.isBlank()) {
            Optional<User> uOpt = userRepository.findByEmail(email);
            if (uOpt.isPresent()) return uOpt.get().getId();
        }
        if (username != null && !username.isBlank()) {
            Optional<User> uOpt = userRepository.findByUsername(username);
            if (uOpt.isPresent()) return uOpt.get().getId();
        }
        return null;
    }

    private String resolveRole(String role, Long userId, String email) {
        if (role != null && !role.isBlank()) return role;
        if (userId != null) {
            Optional<User> uOpt = userRepository.findById(userId);
            if (uOpt.isPresent()) return uOpt.get().getRole();
        }
        if (email != null && !email.isBlank()) {
            Optional<User> uOpt = userRepository.findByEmail(email);
            if (uOpt.isPresent()) return uOpt.get().getRole();
        }
        return "CUSTOMER";
    }
}