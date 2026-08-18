package com.shiptrack.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.shiptrack.backend.entity.Shipment;
import com.shiptrack.backend.repository.ShipmentRepository;

@Service
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final RouteHistoryService routeHistoryService;

    public ShipmentService(ShipmentRepository shipmentRepository, RouteHistoryService routeHistoryService) {
        this.shipmentRepository = shipmentRepository;
        this.routeHistoryService = routeHistoryService;
    }

    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    public List<Shipment> getShipmentsForUser(Long userId, String email, String username, String role) {
        String normalizedRole = (role != null) ? role.toUpperCase() : "";
        if (normalizedRole.startsWith("ROLE_")) {
            normalizedRole = normalizedRole.substring(5);
        }

        // Support Agent can see ALL shipments
        if ("SUPPORT_AGENT".equals(normalizedRole)) {
            return shipmentRepository.findAll();
        }

        // Admin can see THEIR created shipments only
        if ("ADMIN".equals(normalizedRole) || "ADMINISTRATOR".equals(normalizedRole)) {
            if (userId != null || (email != null && !email.isBlank())) {
                List<Shipment> list = shipmentRepository.findByCreatedByUserIdOrCreatedByEmailIgnoreCase(userId, email != null ? email : "");
                if (!list.isEmpty()) {
                    return list;
                }
            }
            if (userId != null) {
                return shipmentRepository.findByCreatedByUserId(userId);
            }
            return List.of();
        }

        // Logistics Operator can see THEIR assigned shipments only
        if ("LOGISTICS_OPERATOR".equals(normalizedRole) || "OPERATOR".equals(normalizedRole)) {
            if (userId != null || (email != null && !email.isBlank())) {
                List<Shipment> list = shipmentRepository.findByAssignedOperatorIdOrOperatorEmailIgnoreCase(userId, email != null ? email : "");
                if (!list.isEmpty()) {
                    return list;
                }
            }
            // Fallback matching by senderName/driverName using email or username
            String searchStr = (email != null && !email.isBlank()) ? email.toLowerCase() : (username != null ? username.toLowerCase() : "");
            if (!searchStr.isBlank()) {
                return shipmentRepository.findAll().stream()
                        .filter(s -> (s.getSenderName() != null && s.getSenderName().toLowerCase().contains(searchStr)) ||
                                     (s.getOperatorEmail() != null && s.getOperatorEmail().equalsIgnoreCase(searchStr)) ||
                                     (s.getAssignedOperatorId() != null && s.getAssignedOperatorId().equals(userId)))
                        .toList();
            }
            return List.of();
        }

        // Customer can see THEIR shipments only
        if ("CUSTOMER".equals(normalizedRole) || "BUSINESS_CLIENT".equals(normalizedRole)) {
            if (userId != null || (email != null && !email.isBlank())) {
                List<Shipment> list = shipmentRepository.findByCustomerIdOrCustomerEmailIgnoreCase(userId, email != null ? email : "");
                if (!list.isEmpty()) {
                    return list;
                }
            }
            String searchStr = (email != null && !email.isBlank()) ? email.toLowerCase() : (username != null ? username.toLowerCase() : "");
            if (!searchStr.isBlank()) {
                return shipmentRepository.findAll().stream()
                        .filter(s -> (s.getReceiverName() != null && s.getReceiverName().toLowerCase().contains(searchStr)) ||
                                     (s.getCustomerEmail() != null && s.getCustomerEmail().equalsIgnoreCase(searchStr)) ||
                                     (s.getCustomerId() != null && s.getCustomerId().equals(userId)))
                        .toList();
            }
            return List.of();
        }

        return List.of();
    }

    public List<Shipment> getShipmentsByCreatedByAdmin(Long adminId) {
        if (adminId == null) {
            return List.of();
        }
        return shipmentRepository.findByCreatedByUserId(adminId);
    }

    public List<Shipment> getShipmentsByCustomerId(Long customerId) {
        if (customerId == null) {
            return List.of();
        }
        return shipmentRepository.findByCustomerId(customerId);
    }

    public Shipment getShipmentById(@NonNull Long id) {
        return shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));
    }

    public Optional<Shipment> getShipmentByTrackingNumber(String trackingNumber) {
        return shipmentRepository.findByTrackingNumber(trackingNumber);
    }

    public boolean canUserAccessShipment(Shipment shipment, Long userId, String role) {
        if (shipment == null) {
            return false;
        }

        String normalizedRole = (role != null) ? role.toUpperCase() : "";
        if (normalizedRole.startsWith("ROLE_")) {
            normalizedRole = normalizedRole.substring(5);
        }

        if ("ADMINISTRATOR".equals(normalizedRole) || "ADMIN".equals(normalizedRole) || "SUPPORT_AGENT".equals(normalizedRole) || "BUSINESS_CLIENT".equals(normalizedRole)) {
            return true;
        }

        if ("LOGISTICS_OPERATOR".equals(normalizedRole)) {
            return true;
        }

        if ("CUSTOMER".equals(normalizedRole)) {
            if (userId == null) return true; // Allow lookup by tracking ID
            return userId.equals(shipment.getCustomerId()) || userId.equals(shipment.getCreatedByUserId());
        }

        return true;
    }

    public Shipment createShipment(@NonNull Shipment shipment) {
        Shipment saved = shipmentRepository.save(shipment);

        // Record initial route snapshot
        if (saved.getPickupLatitude() != null && saved.getPickupLongitude() != null) {
            routeHistoryService.recordSnapshot(
                    saved.getId(),
                    saved.getPickupLatitude(),
                    saved.getPickupLongitude(),
                    saved.getStatus() != null ? saved.getStatus() : "PENDING",
                    "Pickup Location: " + (saved.getPickupAddress() != null ? saved.getPickupAddress() : "Hub")
            );
        }
        if (saved.getLatitude() != null && saved.getLongitude() != null) {
            routeHistoryService.recordSnapshot(
                    saved.getId(),
                    saved.getLatitude(),
                    saved.getLongitude(),
                    saved.getStatus() != null ? saved.getStatus() : "IN_TRANSIT",
                    "Current Driver Checkpoint"
            );
        }

        return saved;
    }

    public Shipment updateShipment(@NonNull Long id, @NonNull Shipment updatedShipment) {
        Shipment existingShipment = getShipmentById(id);

        existingShipment.setTrackingNumber(updatedShipment.getTrackingNumber());
        existingShipment.setSenderName(updatedShipment.getSenderName());
        existingShipment.setReceiverName(updatedShipment.getReceiverName());
        existingShipment.setDeliveryAddress(updatedShipment.getDeliveryAddress());
        existingShipment.setStatus(updatedShipment.getStatus());
        if (updatedShipment.getLatitude() != null) {
            existingShipment.setLatitude(updatedShipment.getLatitude());
        }
        if (updatedShipment.getLongitude() != null) {
            existingShipment.setLongitude(updatedShipment.getLongitude());
        }
        if (updatedShipment.getCustomerId() != null) {
            existingShipment.setCustomerId(updatedShipment.getCustomerId());
        }
        if (updatedShipment.getCreatedByUserId() != null) {
            existingShipment.setCreatedByUserId(updatedShipment.getCreatedByUserId());
        }

        Shipment saved = shipmentRepository.save(existingShipment);

        // Record waypoint snapshot
        if (saved.getLatitude() != null && saved.getLongitude() != null) {
            routeHistoryService.recordSnapshot(
                    saved.getId(),
                    saved.getLatitude(),
                    saved.getLongitude(),
                    saved.getStatus(),
                    "Status Update: " + saved.getStatus()
            );
        }

        return saved;
    }

    public void deleteShipment(@NonNull Long id) {
        Shipment shipment = getShipmentById(id);
        shipmentRepository.delete(shipment);
    }
}