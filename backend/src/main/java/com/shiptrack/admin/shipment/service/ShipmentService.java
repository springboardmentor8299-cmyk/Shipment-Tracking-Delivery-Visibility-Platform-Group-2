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

//import com.shiptrack.auth.repository.UserRepository;
import com.shiptrack.auth.entity.User;

@Service
public class ShipmentService {

    private final ShipmentRepository shipmentRepository1;
    private final ActivityService activityService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private GeoapifyService geoapifyService;

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
            // FIX: Pass the inner Long ID (.getId()) to the repository, not the object
            // itself
            User customer = userRepository.findById(shipment.getCustomerId().getId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));

            shipment.setCustomerId(customer);
            shipment.setCustomerName(customer.getName());
        }

        shipment.setTotalWeightOfItems(formatWeight(shipment.getTotalWeightOfItems()));
        shipment.setShipmentCost(formatCost(shipment.getShipmentCost()));

        // Resolve the human-readable origin/destination into real coordinates up
        // front. Without this, destinationLatitude/Longitude stay null, which
        // made every live-location ping fall back to a 0 km "distance" and the
        // shipment got auto-marked DELIVERED within a couple of polling ticks.
        geocodeOriginAndDestination(shipment);

        Shipment saved = shipmentRepository1.save(shipment);

        try {
            activityService.save(
                    null,
                    "SHIPMENT_CREATED",
                    "Shipment " + saved.getTrackingId() + " created");
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

        // --- FORMAT WEIGHT & COST IN BACKEND ---
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

        // Re-resolve coordinates when the address text changed, and also
        // backfill them for older records saved before geocoding existed —
        // simply editing and re-saving a shipment now heals it.
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
        return saved;
    }

    public void deleteShipment(Long id) {
        if (!shipmentRepository1.existsById(id)) {
            throw new RuntimeException("Shipment not found");
        }
        // capture tracking id for activity
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

    // ================= HELPER METHODS =================

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

    // Fills in origin/destination lat-lng from the address text, but only
    // where they're currently missing — never overwrites coordinates that
    // are already present.
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

    // 1. Live Location Update & Delay Prediction Logic
    public Shipment updateLiveLocation(String trackingId, LocationUpdateRequest request) {

        Shipment shipment = shipmentRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new RuntimeException("Shipment not found : " + trackingId));

        // -------------------------
        // Save Current GPS Location
        // -------------------------
        shipment.setCurrentLatitude(request.getCurrentLatitude());
        shipment.setCurrentLongitude(request.getCurrentLongitude());
        shipment.setTruckSpeed(request.getTruckSpeed());
        shipment.setLastLocationUpdate(LocalDateTime.now());

        if (request.getCurrentLocationName() != null &&
                !request.getCurrentLocationName().isBlank()) {
            shipment.setCurrentLocationName(request.getCurrentLocationName());
        }

        // -------------------------
        // Calculate Remaining Distance
        // -------------------------
        GeoapifyService.RouteMetrics metrics = geoapifyService.calculateRouteMetrics(
                request.getCurrentLatitude(),
                request.getCurrentLongitude(),
                shipment.getDestinationLatitude(),
                shipment.getDestinationLongitude());

        boolean metricsAvailable = metrics.distanceKm() != null && metrics.durationMinutes() != null;

        if (metricsAvailable) {
            shipment.setRemainingDistance(metrics.distanceKm());

            // -------------------------
            // Calculate ETA
            // -------------------------
            LocalDateTime eta = LocalDateTime.now().plusMinutes(metrics.durationMinutes().longValue());

            shipment.setEstimatedDeliveryTime(eta);
        }
        // If metrics couldn't be calculated (e.g. destination coordinates are
        // still missing, or the routing API call failed), we deliberately
        // leave remainingDistance/estimatedDeliveryTime untouched rather than
        // zeroing them out — a failed lookup must never look like "arrived".

        // -------------------------
        // Auto Delivered
        // -------------------------
        if (metricsAvailable && metrics.distanceKm() <= 0.20) { // within 200 meters

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

        System.out.println("----------------------------");
        System.out.println("Tracking : " + saved.getTrackingId());
        System.out.println("Latitude : " + saved.getCurrentLatitude());
        System.out.println("Longitude: " + saved.getCurrentLongitude());
        System.out.println("Remaining: " + saved.getRemainingDistance());
        System.out.println("ETA      : " + saved.getEstimatedDeliveryTime());
        System.out.println("----------------------------");

        return saved;
    }

    // 2. Status Management
    public Shipment updateShipmentStatus(String trackingId, StatusUpdateRequest request) {
        Shipment shipment = shipmentRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new RuntimeException("Shipment not found with ID: " + trackingId));

        shipment.setStatus(request.getStatus());

        if (request.getStatus() == ShipmentStatus.DELIVERED) {
            shipment.setRemainingDistance(0.0);
        }

        // If the shipment has moved on but no driver-app/IoT GPS ping has ever
        // arrived for it, fall back to the origin so "Current Location" has
        // real data to show instead of staying blank.
        if (shipment.getCurrentLocationName() == null
                && (request.getStatus() == ShipmentStatus.IN_TRANSIT
                        || request.getStatus() == ShipmentStatus.OUT_FOR_DELIVERY)) {
            shipment.setCurrentLocationName(shipment.getOrigin());
            shipment.setCurrentLatitude(shipment.getOriginLatitude());
            shipment.setCurrentLongitude(shipment.getOriginLongitude());
            shipment.setLastLocationUpdate(java.time.LocalDateTime.now());
        }

        return shipmentRepository.save(shipment);
    }

    // 3. Get Tracking Details
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