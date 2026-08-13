package com.shiptrack.admin.shipment.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shiptrack.activity.service.ActivityService;
import com.shiptrack.admin.shipment.dto.LocationUpdateRequest;
import com.shiptrack.admin.shipment.dto.StatusUpdateRequest;
import com.shiptrack.admin.shipment.dto.TrackingResponseDto;
import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.entity.ShipmentStatus;
import com.shiptrack.admin.shipment.repository.ShipmentRepository;
import com.shiptrack.auth.repository.UserRepository;
import com.shiptrack.driver.entity.Driver;
import com.shiptrack.driver.entity.DriverStatus;
import com.shiptrack.driver.repository.DriverRepository;

//import com.shiptrack.auth.repository.UserRepository;
import com.shiptrack.auth.entity.User;
import com.shiptrack.notification.entity.NotificationType;
import com.shiptrack.notification.service.NotificationService;

@Service
public class ShipmentService {

    private static final List<ShipmentStatus> TERMINAL_STATUSES = List.of(
            ShipmentStatus.DELIVERED,
            ShipmentStatus.CANCELLED,
            ShipmentStatus.FAILED_DELIVERY);

    private final ShipmentRepository shipmentRepository1;
    private final ActivityService activityService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private GeoapifyService geoapifyService;

    @Autowired
    private NotificationService notificationService;

    public ShipmentService(ShipmentRepository shipmentRepository, ActivityService activityService) {

        this.shipmentRepository1 = shipmentRepository;
        this.activityService = activityService;

    }

    public List<Shipment> getAllShipments() {

        return shipmentRepository1.findAll();

    }

    public Shipment addShipment(Shipment shipment) {
        if (shipment.getTrackingId() == null || shipment.getTrackingId().isBlank()) {
            shipment.setTrackingId(generateTrackingId());
        }

        if (shipment.getCustomerId() != null && shipment.getCustomerId().getId() != null) {

            User customer = userRepository.findById(shipment.getCustomerId().getId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            shipment.setCustomerId(customer);
            shipment.setCustomerName(customer.getName());
        }

        shipment.setTotalWeightOfItems(formatWeight(shipment.getTotalWeightOfItems()));
        shipment.setShipmentCost(formatCost(shipment.getShipmentCost()));

        geocodeOriginAndDestination(shipment);

        Shipment saved = shipmentRepository1.save(shipment);

        try {
            activityService.save(
                    null,
                    "SHIPMENT_CREATED",
                    "Shipment " + saved.getTrackingId() + " created");
        } catch (Exception ignored) {
        }

        try {
            notificationService.notify(
                    saved.getCustomerId(),
                    NotificationType.SHIPMENT_UPDATE,
                    "Shipment " + saved.getTrackingId() + " created",
                    "Your shipment from " + saved.getOrigin() + " to " + saved.getDestination()
                            + " has been created and is being processed.",
                    saved.getTrackingId());
        } catch (Exception ignored) {
        }

        return saved;
    }

    public Shipment updateShipment(Long id, Shipment shipment) {
        Shipment existingShipment = shipmentRepository1.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        if (shipment.getCustomerId() != null && shipment.getCustomerId().getId() != null) {
            User customer = userRepository.findById(shipment.getCustomerId().getId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            existingShipment.setCustomerId(customer);
        } else {
            existingShipment.setCustomerId(null);
        }

        existingShipment.setTotalWeightOfItems(formatWeight(shipment.getTotalWeightOfItems()));
        existingShipment.setShipmentCost(formatCost(shipment.getShipmentCost()));

        existingShipment.setCustomerName(shipment.getCustomerName());
        existingShipment.setReceiverName(shipment.getReceiverName());
        existingShipment.setNoOfItems(shipment.getNoOfItems());
        existingShipment.setTotalWeightOfItems(shipment.getTotalWeightOfItems());
        existingShipment.setShipmentCost(shipment.getShipmentCost());

        boolean originChanged = shipment.getOrigin() != null
                && !shipment.getOrigin().equals(existingShipment.getOrigin());
        boolean destinationChanged = shipment.getDestination() != null
                && !shipment.getDestination().equals(existingShipment.getDestination());

        existingShipment.setOrigin(shipment.getOrigin());
        existingShipment.setDestination(shipment.getDestination());
        existingShipment.setStatus(shipment.getStatus());
        existingShipment.setShipmentDate(shipment.getShipmentDate());
        existingShipment.setDeliveryDate(shipment.getDeliveryDate());

        if (originChanged) {
            existingShipment.setOriginLatitude(null);
            existingShipment.setOriginLongitude(null);
        }
        if (destinationChanged) {
            existingShipment.setDestinationLatitude(null);
            existingShipment.setDestinationLongitude(null);
        }
        geocodeOriginAndDestination(existingShipment);

        Shipment saved = shipmentRepository1.save(existingShipment);
        try {
            activityService.save(null, "SHIPMENT_UPDATED", "Shipment " + saved.getTrackingId() + " updated");
        } catch (Exception ignored) {
        }
        releaseDriverIfTerminal(saved);
        return saved;
    }

    public void deleteShipment(Long id) {
        if (!shipmentRepository1.existsById(id)) {
            throw new RuntimeException("Shipment not found");
        }
        shipmentRepository1.findById(id).ifPresent(s -> {
            try {
                activityService.save(null, "SHIPMENT_DELETED", "Shipment " + s.getTrackingId() + " deleted");
            } catch (Exception ignored) {
            }
        });
        shipmentRepository1.deleteById(id);
    }

    private String generateTrackingId() {
        return "TRK-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void releaseDriverIfTerminal(Shipment shipment) {
        Driver driver = shipment.getAssignedDriver();
        if (driver == null || !TERMINAL_STATUSES.contains(shipment.getStatus())) {
            return;
        }

        boolean hasOtherActiveShipment = shipmentRepository.findByAssignedDriver_Id(driver.getId())
                .stream()
                .anyMatch(s -> !s.getId().equals(shipment.getId())
                        && !TERMINAL_STATUSES.contains(s.getStatus()));

        if (!hasOtherActiveShipment) {
            driver.setStatus(DriverStatus.AVAILABLE);
            driverRepository.save(driver);
        }
    }

    private String formatWeight(String weight) {
        if (weight == null || weight.isBlank())
            return "";
        weight = weight.trim();
        // Don't append if already formatted with "kg"
        if (weight.toLowerCase().endsWith("kg"))
            return weight;
        return weight + " kg";
    }

    private String formatCost(String cost) {
        if (cost == null || cost.isBlank())
            return "";
        cost = cost.trim();
        // Don't append if already formatted with "₹"
        if (cost.startsWith("₹"))
            return cost;
        return "₹" + cost;
    }

    private void geocodeOriginAndDestination(Shipment shipment) {
        if (shipment.getOriginLatitude() == null || shipment.getOriginLongitude() == null) {
            double[] originCoords = geoapifyService.forwardGeocode(shipment.getOrigin());
            if (originCoords != null) {
                shipment.setOriginLatitude(originCoords[0]);
                shipment.setOriginLongitude(originCoords[1]);
            }
        }

        if (shipment.getDestinationLatitude() == null || shipment.getDestinationLongitude() == null) {
            double[] destCoords = geoapifyService.forwardGeocode(shipment.getDestination());
            if (destCoords != null) {
                shipment.setDestinationLatitude(destCoords[0]);
                shipment.setDestinationLongitude(destCoords[1]);
            }
        }
    }

    public Shipment updateLiveLocation(String trackingId, LocationUpdateRequest request) {

        Shipment shipment = shipmentRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new RuntimeException("Shipment not found : " + trackingId));

        LocalDateTime previousEta = shipment.getEstimatedDeliveryTime();

        shipment.setCurrentLatitude(request.getCurrentLatitude());
        shipment.setCurrentLongitude(request.getCurrentLongitude());
        shipment.setTruckSpeed(request.getTruckSpeed());
        shipment.setLastLocationUpdate(LocalDateTime.now());

        if (request.getCurrentLocationName() != null &&
                !request.getCurrentLocationName().isBlank()) {
            shipment.setCurrentLocationName(request.getCurrentLocationName());
        }

        GeoapifyService.RouteMetrics metrics = geoapifyService.calculateRouteMetrics(
                request.getCurrentLatitude(),
                request.getCurrentLongitude(),
                shipment.getDestinationLatitude(),
                shipment.getDestinationLongitude());

        boolean metricsAvailable = metrics.distanceKm() != null && metrics.durationMinutes() != null;

        if (metricsAvailable) {
            shipment.setRemainingDistance(metrics.distanceKm());

            // Calculate ETA
            LocalDateTime eta = LocalDateTime.now().plusMinutes(metrics.durationMinutes().longValue());

            shipment.setEstimatedDeliveryTime(eta);
        }

        boolean autoDelivered = metricsAvailable && metrics.distanceKm() <= 0.20; // within 200 meters

        // Auto Delivered
        if (autoDelivered) {

            shipment.setStatus(ShipmentStatus.DELIVERED);
            shipment.setRemainingDistance(0.0);
            shipment.setEstimatedDeliveryTime(LocalDateTime.now());

            shipment.setCurrentLatitude(shipment.getDestinationLatitude());
            shipment.setCurrentLongitude(shipment.getDestinationLongitude());
            shipment.setCurrentLocationName(shipment.getDestination());

            shipment.setTruckSpeed(0.0);

            System.out.println("Shipment Delivered : " + shipment.getTrackingId());
        }

        Shipment saved = shipmentRepository.save(shipment);
        releaseDriverIfTerminal(saved);

        try {
            if (autoDelivered) {
                notificationService.notify(
                        saved.getCustomerId(),
                        NotificationType.DELIVERY_ALERT,
                        "Shipment " + saved.getTrackingId() + " delivered",
                        "Your shipment has arrived at " + saved.getDestination() + ".",
                        saved.getTrackingId());
            } else if (metricsAvailable) {
                LocalDateTime newEta = saved.getEstimatedDeliveryTime();
                if (previousEta == null) {
                    notificationService.notify(
                            saved.getCustomerId(),
                            NotificationType.ETA_UPDATE,
                            "Shipment " + saved.getTrackingId() + " ETA available",
                            "Estimated delivery time: " + newEta + ".",
                            saved.getTrackingId());
                } else {
                    long diffMinutes = java.time.Duration.between(previousEta, newEta).toMinutes();
                    if (diffMinutes >= 20) {
                        notificationService.notify(
                                saved.getCustomerId(),
                                NotificationType.DELAY_WARNING,
                                "Shipment " + saved.getTrackingId() + " running late",
                                "Estimated delivery has slipped to " + newEta + ".",
                                saved.getTrackingId());
                    } else if (Math.abs(diffMinutes) >= 10) {
                        notificationService.notify(
                                saved.getCustomerId(),
                                NotificationType.ETA_UPDATE,
                                "Shipment " + saved.getTrackingId() + " ETA updated",
                                "New estimated delivery time: " + newEta + ".",
                                saved.getTrackingId());
                    }
                }
            }
        } catch (Exception ignored) {
        }

        System.out.println("----------------------------");
        System.out.println("Tracking : " + saved.getTrackingId());
        System.out.println("Latitude : " + saved.getCurrentLatitude());
        System.out.println("Longitude: " + saved.getCurrentLongitude());
        System.out.println("Remaining: " + saved.getRemainingDistance());
        System.out.println("ETA      : " + saved.getEstimatedDeliveryTime());
        System.out.println("----------------------------");

        return saved;
    }

    public Shipment updateShipmentStatus(String trackingId, StatusUpdateRequest request) {
        Shipment shipment = shipmentRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new RuntimeException("Shipment not found with ID: " + trackingId));

        ShipmentStatus previousStatus = shipment.getStatus();

        shipment.setStatus(request.getStatus());

        if (request.getStatus() == ShipmentStatus.DELIVERED) {
            shipment.setRemainingDistance(0.0);
        }

        if (shipment.getCurrentLocationName() == null
                && (request.getStatus() == ShipmentStatus.IN_TRANSIT
                        || request.getStatus() == ShipmentStatus.OUT_FOR_DELIVERY)) {
            shipment.setCurrentLocationName(shipment.getOrigin());
            shipment.setCurrentLatitude(shipment.getOriginLatitude());
            shipment.setCurrentLongitude(shipment.getOriginLongitude());
            shipment.setLastLocationUpdate(java.time.LocalDateTime.now());
        }

        Shipment saved = shipmentRepository.save(shipment);
        releaseDriverIfTerminal(saved);

        if (request.getStatus() != previousStatus) {
            try {
                notifyStatusChange(saved, request.getStatus());
            } catch (Exception ignored) {
            }
        }

        return saved;
    }

    private void notifyStatusChange(Shipment shipment, ShipmentStatus newStatus) {

        NotificationType type;
        String title;
        String message;

        switch (newStatus) {
            case OUT_FOR_DELIVERY -> {
                type = NotificationType.DELIVERY_ALERT;
                title = "Shipment " + shipment.getTrackingId() + " out for delivery";
                message = "Your shipment is out for delivery to " + shipment.getDestination() + ".";
            }
            case DELIVERED -> {
                type = NotificationType.DELIVERY_ALERT;
                title = "Shipment " + shipment.getTrackingId() + " delivered";
                message = "Your shipment has been delivered to " + shipment.getDestination() + ".";
            }
            case FAILED_DELIVERY -> {
                type = NotificationType.DELAY_WARNING;
                title = "Shipment " + shipment.getTrackingId() + " delivery failed";
                message = "The delivery attempt for your shipment was unsuccessful. "
                        + "It will be rescheduled.";
            }
            case CANCELLED -> {
                type = NotificationType.SHIPMENT_UPDATE;
                title = "Shipment " + shipment.getTrackingId() + " cancelled";
                message = "Your shipment has been cancelled.";
            }
            default -> {
                type = NotificationType.SHIPMENT_UPDATE;
                title = "Shipment " + shipment.getTrackingId() + " updated";
                message = "Status changed to " + newStatus + ".";
            }
        }

        notificationService.notify(
                shipment.getCustomerId(),
                type,
                title,
                message,
                shipment.getTrackingId());
    }

    public TrackingResponseDto getTrackingDetails(String trackingId) {
        Shipment shipment = shipmentRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new RuntimeException("Shipment not found with ID: " + trackingId));

        TrackingResponseDto dto = new TrackingResponseDto();
        dto.setTrackingId(shipment.getTrackingId());
        dto.setStatus(shipment.getStatus());
        dto.setCurrentLatitude(shipment.getCurrentLatitude());
        dto.setCurrentLongitude(shipment.getCurrentLongitude());
        dto.setCurrentLocationName(shipment.getCurrentLocationName());
        dto.setDestinationLatitude(shipment.getDestinationLatitude());
        dto.setDestinationLongitude(shipment.getDestinationLongitude());
        dto.setTruckSpeed(shipment.getTruckSpeed());
        dto.setRemainingDistanceKm(shipment.getRemainingDistance());
        dto.setEstimatedDeliveryTime(shipment.getEstimatedDeliveryTime());
        dto.setLastLocationUpdate(shipment.getLastLocationUpdate());

        return dto;
    }

}