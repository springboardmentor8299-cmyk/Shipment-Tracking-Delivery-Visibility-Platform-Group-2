package com.shiptrack.service;

import com.shiptrack.dto.*;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.TrackingEvent;
import com.shiptrack.entity.User;
import com.shiptrack.exception.ForbiddenException;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.DelayPredictionRepository;
import com.shiptrack.repository.DeliveryPredictionRepository;
import com.shiptrack.repository.ProofOfDeliveryRepository;
import com.shiptrack.repository.RouteHistoryPointRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.TrackingEventRepository;
import com.shiptrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j

@Service
@RequiredArgsConstructor
public class ShipmentService {

    private static final Set<String> VALID_STATUSES = Set.of(
            "CREATED", "PICKED_UP", "AT_SORTING_FACILITY", "IN_TRANSIT",
            "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "RETURNED"
    );

    private final ShipmentRepository shipmentRepository;
    private final TrackingEventRepository trackingEventRepository;
    private final UserRepository userRepository;
    private final GeocodingService geocodingService;
    private final LiveTrackingService liveTrackingService;
    private final EtaService etaService;
    private final ForecastService forecastService;
    private final DeliveryPredictionRepository deliveryPredictionRepository;
    private final DelayPredictionRepository delayPredictionRepository;
    private final DelayPredictionService delayPredictionService;
    private final ProofOfDeliveryRepository proofOfDeliveryRepository;
    private final RouteHistoryPointRepository routeHistoryPointRepository;
    private final RouteHistoryService routeHistoryService;
    private final SecureRandom random = new SecureRandom();

    // ==================== Helpers ====================

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private void requireAdmin(User user) {
        if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new ForbiddenException("Access denied. Admins only.");
        }
    }

    private void requireAdminOrSupport(User user) {
        String role = user.getRole();
        if (!"ADMIN".equalsIgnoreCase(role) && !"SUPPORT_ASSISTANT".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Access denied. Admins or Support only.");
        }
    }

    private void requireStaff(User user) {
        String role = user.getRole();
        if (!"ADMIN".equalsIgnoreCase(role)
                && !"SUPPORT_ASSISTANT".equalsIgnoreCase(role)
                && !"DELIVERY_OPERATOR".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Access denied. Admins, Support or Delivery Operators only.");
        }
    }

    private String generateTrackingNumber() {
        String candidate;
        do {
            candidate = "TRK" + (100000 + random.nextInt(900000));
        } while (shipmentRepository.existsByTrackingNumber(candidate));
        return candidate;
    }

    private int progressForStatus(String status) {
        return switch (status) {
            case "CREATED" -> 5;
            case "PICKED_UP" -> 20;
            case "AT_SORTING_FACILITY" -> 35;
            case "IN_TRANSIT" -> 55;
            case "OUT_FOR_DELIVERY" -> 80;
            case "DELIVERED" -> 100;
            case "CANCELLED" -> 0;
            case "RETURNED" -> 0;
            default -> 0;
        };
    }

    private LatLng resolvePosition(Shipment shipment, Double latitude, Double longitude) {
        if (latitude != null && longitude != null) {
            return new LatLng(latitude, longitude);
        }
        TrackingEvent last = trackingEventRepository.findByShipmentIdOrderByRecordedAtAsc(shipment.getId())
                .stream()
                .max(Comparator.comparing(TrackingEvent::getId))
                .orElse(null);
        if (last != null && last.getLatitude() != null && last.getLongitude() != null) {
            return new LatLng(last.getLatitude(), last.getLongitude());
        }
        if (shipment.getOriginLatitude() != null && shipment.getOriginLongitude() != null) {
            return new LatLng(shipment.getOriginLatitude(), shipment.getOriginLongitude());
        }
        return null;
    }

    private ShipmentResponse toResponse(Shipment shipment, boolean includeEvents) {

        log.debug("toResponse: building response for shipment {}", shipment.getId());

        List<TrackingEvent> events = trackingEventRepository
                .findByShipmentIdOrderByRecordedAtAsc(shipment.getId());

        TrackingEvent latest = events.stream()
                .max(Comparator.comparing(TrackingEvent::getId))
                .orElse(null);

        ShipmentResponse.ShipmentResponseBuilder builder = ShipmentResponse.builder()
                .id(shipment.getId())
                .trackingNumber(shipment.getTrackingNumber())
                .senderName(shipment.getSenderName())
                .senderAddress(shipment.getSenderAddress())
                .receiverName(shipment.getReceiverName())
                .deliveryAddress(shipment.getDeliveryAddress())
                .status(shipment.getStatus())
                .progressPercent(progressForStatus(shipment.getStatus()))
                .originLatitude(shipment.getOriginLatitude())
                .originLongitude(shipment.getOriginLongitude())
                .destinationLatitude(shipment.getDestinationLatitude())
                .destinationLongitude(shipment.getDestinationLongitude())
                .estimatedDeliveryTime(shipment.getEstimatedDeliveryTime())
                .actualDeliveryTime(shipment.getActualDeliveryTime())
                .estimatedDuration(shipment.getEstimatedDuration())
                .totalDistance(shipment.getTotalDistance())
                .podVerificationStatus(proofOfDeliveryRepository.findByShipmentId(shipment.getId())
                        .map(p -> p.getVerificationStatus())
                        .orElse(null))
                .createdAt(shipment.getCreatedAt());

        try {
            builder.createdByName(shipment.getCreatedBy() != null ? shipment.getCreatedBy().getName() : null);
        } catch (Exception e) {
            log.warn("toResponse: failed to resolve createdBy name for shipment {}, using fallback", shipment.getId(), e);
            builder.createdByName(null);
        }

        if (latest != null) {
            builder.latestLatitude(latest.getLatitude())
                    .latestLongitude(latest.getLongitude())
                    .latestLocationStatus(latest.getStatus())
                    .latestEventAt(latest.getRecordedAt());
        }

        if (includeEvents) {
            builder.events(events.stream()
                    .map(this::toEventResponse)
                    .collect(Collectors.toList()));
        }

        return builder.build();
    }

    private TrackingEventResponse toEventResponse(TrackingEvent event) {
        return TrackingEventResponse.builder()
                .id(event.getId())
                .latitude(event.getLatitude())
                .longitude(event.getLongitude())
                .status(event.getStatus())
                .recordedAt(event.getRecordedAt())
                .build();
    }

    // ==================== Core operations ====================

    @Transactional
    public ShipmentResponse createShipment(ShipmentRequest request, String currentUserEmail) {

        User currentUser = getUserByEmail(currentUserEmail);

        LatLng originCoords = geocodingService.geocodeAddress(request.getSenderAddress());
        LatLng destCoords = geocodingService.geocodeAddress(request.getDeliveryAddress());

        Double totalDistance = null;
        Long estimatedDuration = null;
        String routePolyline = null;
        if (originCoords != null && destCoords != null) {
            try {
                RouteInfo route = geocodingService.calculateRoute(originCoords, destCoords);
                if (route != null) {
                    totalDistance = route.getDistanceKm();
                    estimatedDuration = route.getDurationMin();
                    routePolyline = route.getPolylinePoints();
                }
            } catch (Exception e) {
                log.warn("Failed to calculate route for shipment creation", e);
            }
        }

        Shipment shipment = Shipment.builder()
                .trackingNumber(generateTrackingNumber())
                .senderName(request.getSenderName())
                .senderAddress(request.getSenderAddress())
                .receiverName(request.getReceiverName())
                .deliveryAddress(request.getDeliveryAddress())
                .status("CREATED")
                .originLatitude(originCoords != null ? originCoords.getLatitude() : null)
                .originLongitude(originCoords != null ? originCoords.getLongitude() : null)
                .destinationLatitude(destCoords != null ? destCoords.getLatitude() : null)
                .destinationLongitude(destCoords != null ? destCoords.getLongitude() : null)
                .totalDistance(totalDistance)
                .estimatedDuration(estimatedDuration)
                .routePolyline(routePolyline)
                .createdBy(currentUser)
                .build();

        shipment = shipmentRepository.save(shipment);

        // Seed the first tracking event so the timeline always has a starting point
        TrackingEvent initialEvent = TrackingEvent.builder()
                .shipment(shipment)
                .status("CREATED")
                .build();

        trackingEventRepository.save(initialEvent);

        try {
            forecastService.generateForecast(shipment.getId());
        } catch (Exception e) {
            log.warn("Failed to generate forecast for shipment {}", shipment.getId(), e);
        }

        liveTrackingService.broadcastNewShipmentAlert(
                shipment.getId(),
                shipment.getTrackingNumber(),
                shipment.getSenderName(),
                shipment.getReceiverName()
        );

        return toResponse(shipment, true);
    }

    @Transactional(readOnly = true)
    public List<ShipmentResponse> getMyShipments(String currentUserEmail) {

        User currentUser = getUserByEmail(currentUserEmail);

        return shipmentRepository.findByCreatedByOrderByCreatedAtDesc(currentUser)
                .stream()
                .map(s -> toResponse(s, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShipmentResponse> getAllShipments(String currentUserEmail) {

        requireStaff(getUserByEmail(currentUserEmail));

        return shipmentRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(s -> toResponse(s, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ShipmentResponse getByTrackingNumber(String trackingNumber) {

        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No shipment found with tracking number " + trackingNumber));

        return toResponse(shipment, true);
    }

    @Transactional(readOnly = true)
    public ShipmentResponse getById(Long id, String currentUserEmail) {

        User currentUser = getUserByEmail(currentUserEmail);

        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found."));

        boolean isOwner = shipment.getCreatedBy() != null
                && shipment.getCreatedBy().getId().equals(currentUser.getId());

        if (!isOwner && !isStaff(currentUser)) {
            throw new ForbiddenException("You do not have access to this shipment.");
        }

        return toResponse(shipment, true);
    }

    private boolean isStaff(User user) {
        String role = user.getRole();
        return "ADMIN".equalsIgnoreCase(role)
                || "SUPPORT_ASSISTANT".equalsIgnoreCase(role)
                || "DELIVERY_OPERATOR".equalsIgnoreCase(role);
    }

    @Transactional
    public ShipmentDetailResponse getShipmentDetail(Long id, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        requireStaff(currentUser);

        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found."));

        List<TrackingEvent> events = trackingEventRepository
                .findByShipmentIdOrderByRecordedAtAsc(shipment.getId());

        TrackingEvent latest = events.stream()
                .max(Comparator.comparing(TrackingEvent::getId))
                .orElse(null);

        String createdByName = null;
        try {
            createdByName = shipment.getCreatedBy() != null ? shipment.getCreatedBy().getName() : null;
        } catch (Exception e) {
            log.warn("getShipmentDetail: failed to resolve createdBy name", e);
        }

        EtaResponse eta = null;
        try {
            eta = etaService.calculateEta(id);
        } catch (Exception e) {
            log.warn("getShipmentDetail: failed to get ETA for shipment {}", id, e);
        }

        ForecastResponse forecast = null;
        try {
            forecast = forecastService.generateForecast(id);
        } catch (Exception e) {
            log.warn("getShipmentDetail: failed to get forecast for shipment {}", id, e);
        }

        DelayStatusResponse delayStatus = null;
        try {
            delayStatus = delayPredictionService.getDelayStatus(id);
        } catch (Exception e) {
            log.warn("getShipmentDetail: failed to get delay status for shipment {}", id, e);
        }

        ShipmentDetailResponse.ShipmentDetailResponseBuilder builder = ShipmentDetailResponse.builder()
                .id(shipment.getId())
                .trackingNumber(shipment.getTrackingNumber())
                .senderName(shipment.getSenderName())
                .senderAddress(shipment.getSenderAddress())
                .receiverName(shipment.getReceiverName())
                .deliveryAddress(shipment.getDeliveryAddress())
                .status(shipment.getStatus())
                .progressPercent(progressForStatus(shipment.getStatus()))
                .createdByName(createdByName)
                .createdAt(shipment.getCreatedAt())
                .originLatitude(shipment.getOriginLatitude())
                .originLongitude(shipment.getOriginLongitude())
                .destinationLatitude(shipment.getDestinationLatitude())
                .destinationLongitude(shipment.getDestinationLongitude())
                .estimatedDeliveryTime(shipment.getEstimatedDeliveryTime())
                .actualDeliveryTime(shipment.getActualDeliveryTime())
                .estimatedDuration(shipment.getEstimatedDuration())
                .totalDistance(shipment.getTotalDistance())
                .events(events.stream().map(this::toEventResponse).collect(Collectors.toList()))
                .eta(eta)
                .forecast(forecast)
                .delayStatus(delayStatus);

        if (latest != null) {
            builder.latestLatitude(latest.getLatitude())
                    .latestLongitude(latest.getLongitude())
                    .latestLocationStatus(latest.getStatus())
                    .latestEventAt(latest.getRecordedAt());
        }

        return builder.build();
    }

    @Transactional
    public ShipmentResponse updateStatus(Long id, ShipmentStatusUpdateRequest request, String currentUserEmail) {

        User currentUser = getUserByEmail(currentUserEmail);
        String role = currentUser.getRole();

        if ("ADMIN".equalsIgnoreCase(role)) {
            // Admins may set any valid status.
        } else if ("DELIVERY_OPERATOR".equalsIgnoreCase(role)) {
            if (!"OUT_FOR_DELIVERY".equalsIgnoreCase(request.getStatus())) {
                throw new ForbiddenException("Access denied. Delivery operators can only mark shipments OUT_FOR_DELIVERY.");
            }
        } else {
            throw new ForbiddenException("Access denied. Admins only.");
        }

        String newStatus = request.getStatus().toUpperCase();

        if (!VALID_STATUSES.contains(newStatus)) {
            throw new IllegalArgumentException("Invalid status: " + request.getStatus());
        }

        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found."));

        String oldStatus = shipment.getStatus();
        log.info("updateStatus: shipment {} status '{}' -> '{}'", id, oldStatus, newStatus);

        shipment.setStatus(newStatus);

        if ("DELIVERED".equals(newStatus)) {
            shipment.setActualDeliveryTime(java.time.LocalDateTime.now());
        }

        shipmentRepository.save(shipment);

        LatLng position = resolvePosition(shipment, request.getLatitude(), request.getLongitude());

        TrackingEvent event = TrackingEvent.builder()
                .shipment(shipment)
                .status(newStatus)
                .latitude(position != null ? position.getLatitude() : request.getLatitude())
                .longitude(position != null ? position.getLongitude() : request.getLongitude())
                .build();

        trackingEventRepository.save(event);

        if (position != null) {
            routeHistoryService.recordPoint(shipment, position, null, (double) progressForStatus(newStatus));
        }

        if (position != null) {
            liveTrackingService.broadcastLocationUpdate(id, position.getLatitude(), position.getLongitude(), newStatus);
        }

        if ("IN_TRANSIT".equals(newStatus) || "OUT_FOR_DELIVERY".equals(newStatus)) {
            etaService.calculateEtaAsync(id);
        }

        try {
            ShipmentResponse response = toResponse(shipment, true);
            log.info("updateStatus: shipment {} completed successfully. New status: {}", id, newStatus);
            return response;
        } catch (Exception e) {
            log.error("updateStatus: toResponse failed for shipment {} after status change to '{}'", id, newStatus, e);
            throw e;
        }
    }

    @Transactional
    public TrackingEventResponse addTrackingEvent(Long shipmentId, TrackingEventRequest request, String currentUserEmail) {

        requireAdmin(getUserByEmail(currentUserEmail));

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found."));

        TrackingEvent event = TrackingEvent.builder()
                .shipment(shipment)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status(request.getStatus())
                .build();

        event = trackingEventRepository.save(event);

        LatLng position = resolvePosition(shipment, request.getLatitude(), request.getLongitude());
        if (position != null) {
            routeHistoryService.recordPoint(shipment, position, null, null);
        }

        return toEventResponse(event);
    }

    public List<TrackingEventResponse> getTrackingEvents(Long shipmentId) {

        if (!shipmentRepository.existsById(shipmentId)) {
            throw new ResourceNotFoundException("Shipment not found.");
        }

        return trackingEventRepository.findByShipmentIdOrderByRecordedAtAsc(shipmentId)
                .stream()
                .map(this::toEventResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ShipmentResponse updateShipment(Long id, ShipmentUpdateRequest request, String currentUserEmail) {
        requireAdminOrSupport(getUserByEmail(currentUserEmail));

        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found."));

        if (request.getSenderName() != null) shipment.setSenderName(request.getSenderName());
        if (request.getSenderAddress() != null) shipment.setSenderAddress(request.getSenderAddress());
        if (request.getReceiverName() != null) shipment.setReceiverName(request.getReceiverName());
        if (request.getDeliveryAddress() != null) shipment.setDeliveryAddress(request.getDeliveryAddress());

        if (request.getSenderAddress() != null || request.getDeliveryAddress() != null) {
            try {
                LatLng originCoords = geocodingService.geocodeAddress(shipment.getSenderAddress());
                LatLng destCoords = geocodingService.geocodeAddress(shipment.getDeliveryAddress());
                shipment.setOriginLatitude(originCoords != null ? originCoords.getLatitude() : null);
                shipment.setOriginLongitude(originCoords != null ? originCoords.getLongitude() : null);
                shipment.setDestinationLatitude(destCoords != null ? destCoords.getLatitude() : null);
                shipment.setDestinationLongitude(destCoords != null ? destCoords.getLongitude() : null);

                if (originCoords != null && destCoords != null) {
                    RouteInfo route = geocodingService.calculateRoute(originCoords, destCoords);
                    if (route != null) {
                        shipment.setTotalDistance(route.getDistanceKm());
                        shipment.setEstimatedDuration(route.getDurationMin());
                        shipment.setRoutePolyline(route.getPolylinePoints());
                    }
                }
            } catch (Exception e) {
                log.warn("updateShipment: failed to re-geocode for shipment {}", id, e);
            }
        }

        shipment = shipmentRepository.save(shipment);
        return toResponse(shipment, true);
    }

    @Transactional
    public void deleteShipment(Long id, String currentUserEmail) {

        requireAdmin(getUserByEmail(currentUserEmail));

        if (!shipmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Shipment not found.");
        }

        trackingEventRepository.deleteByShipmentId(id);
        deliveryPredictionRepository.deleteByShipmentId(id);
        delayPredictionRepository.deleteByShipmentId(id);
        proofOfDeliveryRepository.deleteByShipmentId(id);
        routeHistoryPointRepository.deleteByShipmentId(id);
        shipmentRepository.deleteById(id);
    }

    public ShipmentStatsResponse getStats(String currentUserEmail) {

        requireAdminOrSupport(getUserByEmail(currentUserEmail));

        long total = shipmentRepository.count();
        long created = shipmentRepository.countByStatus("CREATED");
        long inTransit = shipmentRepository.countByStatus("IN_TRANSIT");
        long outForDelivery = shipmentRepository.countByStatus("OUT_FOR_DELIVERY");
        long delivered = shipmentRepository.countByStatus("DELIVERED");
        long cancelled = shipmentRepository.countByStatus("CANCELLED");

        log.debug("getStats: total={}, created={}, inTransit={}, outForDelivery={}, delivered={}, cancelled={}",
                total, created, inTransit, outForDelivery, delivered, cancelled);

        return ShipmentStatsResponse.builder()
                .total(total)
                .created(created)
                .inTransit(inTransit)
                .outForDelivery(outForDelivery)
                .delivered(delivered)
                .cancelled(cancelled)
                .build();
    }
}
