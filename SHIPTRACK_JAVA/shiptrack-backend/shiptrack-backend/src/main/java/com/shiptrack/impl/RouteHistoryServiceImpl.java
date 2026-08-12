package com.shiptrack.impl;

import com.shiptrack.dto.tracking.RouteHistoryResponse;
import com.shiptrack.dto.tracking.RouteLocationRequest;
import com.shiptrack.dto.tracking.RouteSummaryResponse;
import com.shiptrack.entity.DeliveryConfirmation;
import com.shiptrack.entity.DeliveryConfirmationStatus;
import com.shiptrack.entity.DriverLocation;
import com.shiptrack.entity.RouteHistory;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.User;
import com.shiptrack.repository.DeliveryConfirmationRepository;
import com.shiptrack.repository.DriverLocationRepository;
import com.shiptrack.repository.RouteHistoryRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.UserRepository;
import com.shiptrack.service.RouteHistoryService;
import com.shiptrack.util.GoogleMapUtil;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteHistoryServiceImpl implements RouteHistoryService {

    private final RouteHistoryRepository routeHistoryRepository;
    private final DriverLocationRepository driverLocationRepository;
    private final UserRepository userRepository;
    private final ShipmentRepository shipmentRepository;
    private final DeliveryConfirmationRepository deliveryConfirmationRepository;

    public RouteHistoryServiceImpl(
            RouteHistoryRepository routeHistoryRepository,
            DriverLocationRepository driverLocationRepository,
            UserRepository userRepository,
            ShipmentRepository shipmentRepository,
            DeliveryConfirmationRepository deliveryConfirmationRepository) {

        this.routeHistoryRepository = routeHistoryRepository;
        this.driverLocationRepository = driverLocationRepository;
        this.userRepository = userRepository;
        this.shipmentRepository = shipmentRepository;
        this.deliveryConfirmationRepository = deliveryConfirmationRepository;
    }

    @Override
    @Transactional
    public RouteHistoryResponse recordLocation(RouteLocationRequest request) {

        if (request.getShipmentId() == null) {
            throw new RuntimeException("Shipment id is required.");
        }

        if (request.getLatitude() == null
                || !GoogleMapUtil.isValidLatitude(request.getLatitude())) {
            throw new RuntimeException("Invalid latitude.");
        }

        if (request.getLongitude() == null
                || !GoogleMapUtil.isValidLongitude(request.getLongitude())) {
            throw new RuntimeException("Invalid longitude.");
        }

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User driver = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Driver not found."));

        if (driver.getRole() == null
                || !"ROLE_DRIVER".equalsIgnoreCase(driver.getRole().getName())) {

            throw new RuntimeException("Only drivers can record route locations.");
        }

        Shipment shipment = shipmentRepository.findById(request.getShipmentId())
                .orElseThrow(() -> new RuntimeException("Shipment not found."));

        if (shipment.getDriver() == null
                || !shipment.getDriver().getId().equals(driver.getId())) {

            throw new RuntimeException(
                    "This shipment is not assigned to you.");
        }

        RouteHistory history = RouteHistory.builder()
                .shipment(shipment)
                .driver(driver)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .speed(request.getSpeed())
                .timestamp(LocalDateTime.now())
                .build();

        RouteHistory saved = routeHistoryRepository.save(history);

        DriverLocation location = driverLocationRepository
                .findByDriver(driver)
                .orElse(new DriverLocation());

        location.setDriver(driver);
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setSpeed(request.getSpeed());
        driverLocationRepository.save(location);

        return toResponse(saved);
    }

    @Override
    public List<RouteHistoryResponse> getRouteByShipment(Long shipmentId) {

        shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found."));

        return routeHistoryRepository
                .findByShipmentIdOrderByTimestampAsc(shipmentId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RouteHistoryResponse> getRouteByDriver(Long driverId) {

        userRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found."));

        return routeHistoryRepository
                .findByDriverIdOrderByTimestampAsc(driverId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RouteSummaryResponse getRouteSummary(Long shipmentId) {

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found."));

        List<RouteHistory> points = routeHistoryRepository
                .findByShipmentIdOrderByTimestampAsc(shipmentId);

        if (points.isEmpty()) {

            LocalDateTime startTime = shipment.getCreatedAt();

            LocalDateTime endTime = null;

            if (shipment.getShipmentStatus() != null
                    && shipment.getShipmentStatus().name().equals("DELIVERED")) {

                DeliveryConfirmation confirmation =
                        deliveryConfirmationRepository
                                .findByShipmentAndDeliveryStatus(
                                        shipment,
                                        DeliveryConfirmationStatus.CONFIRMED)
                                .orElse(null);

                if (confirmation != null) {
                    endTime = confirmation.getDeliveryTime();
                }
            }

            long totalDurationMinutes = endTime == null
                    ? 0L
                    : Math.max(0L, Duration.between(startTime, endTime).toMinutes());

            double totalDistanceKm = 0.0;

            if (shipment.getDistanceKm() != null && shipment.getDistanceKm() > 0) {
                totalDistanceKm = shipment.getDistanceKm();
            } else if (shipment.getSourceLatitude() != null
                    && shipment.getSourceLongitude() != null
                    && shipment.getDestinationLatitude() != null
                    && shipment.getDestinationLongitude() != null) {

                totalDistanceKm = GoogleMapUtil.calculateDistance(
                        shipment.getSourceLatitude(),
                        shipment.getSourceLongitude(),
                        shipment.getDestinationLatitude(),
                        shipment.getDestinationLongitude());
            }

            return RouteSummaryResponse.builder()
                    .shipmentId(shipmentId)
                    .trackingNumber(shipment.getTrackingNumber())
                    .driverId(shipment.getDriver() != null
                            ? shipment.getDriver().getId()
                            : null)
                    .driverName(shipment.getDriver() != null
                            ? shipment.getDriver().getFullName()
                            : null)
                    .startTime(startTime)
                    .endTime(endTime)
                    .totalStops(0L)
                    .totalDistanceKm(Math.round(totalDistanceKm * 100.0) / 100.0)
                    .totalDurationMinutes(totalDurationMinutes)
                    .build();
        }

        double totalDistanceKm = 0.0;

        for (int i = 1; i < points.size(); i++) {

            RouteHistory previous = points.get(i - 1);
            RouteHistory current = points.get(i);

            totalDistanceKm += GoogleMapUtil.calculateDistance(
                    previous.getLatitude(),
                    previous.getLongitude(),
                    current.getLatitude(),
                    current.getLongitude());
        }

        RouteHistory first = points.get(0);
        RouteHistory last = points.get(points.size() - 1);

        long totalDurationMinutes = Duration
                .between(first.getTimestamp(), last.getTimestamp())
                .toMinutes();

        return RouteSummaryResponse.builder()
                .shipmentId(shipmentId)
                .trackingNumber(first.getShipment().getTrackingNumber())
                .driverId(first.getDriver().getId())
                .driverName(first.getDriver().getFullName())
                .startTime(first.getTimestamp())
                .endTime(last.getTimestamp())
                .totalStops((long) points.size())
                .totalDistanceKm(Math.round(totalDistanceKm * 100.0) / 100.0)
                .totalDurationMinutes(totalDurationMinutes)
                .build();
    }

    private RouteHistoryResponse toResponse(RouteHistory history) {

        Shipment shipment = history.getShipment();

        return RouteHistoryResponse.builder()
                .id(history.getId())
                .shipmentId(shipment.getId())
                .trackingNumber(shipment.getTrackingNumber())
                .driverId(history.getDriver().getId())
                .driverName(history.getDriver().getFullName())
                .latitude(history.getLatitude())
                .longitude(history.getLongitude())
                .speed(history.getSpeed())
                .timestamp(history.getTimestamp())
                .build();
    }
}
