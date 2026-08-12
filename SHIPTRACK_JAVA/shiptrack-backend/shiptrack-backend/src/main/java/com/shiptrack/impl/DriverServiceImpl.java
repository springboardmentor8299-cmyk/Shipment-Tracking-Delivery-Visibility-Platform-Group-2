package com.shiptrack.impl;

import com.shiptrack.dto.driver.DriverDashboardOverviewResponse;
import com.shiptrack.dto.driver.DriverRouteHistoryResponse;
import com.shiptrack.dto.driver.DriverShipmentResponse;
import com.shiptrack.dto.driver.DriverStatusUpdateRequest;
import com.shiptrack.entity.DeliveryConfirmation;
import com.shiptrack.entity.DeliveryConfirmationStatus;
import com.shiptrack.entity.NotificationType;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.ShipmentStatus;
import com.shiptrack.entity.TrackingHistory;
import com.shiptrack.entity.User;
import com.shiptrack.repository.DeliveryConfirmationRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.TrackingHistoryRepository;
import com.shiptrack.repository.UserRepository;
import com.shiptrack.service.DriverService;
import com.shiptrack.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class DriverServiceImpl implements DriverService {

    private static final List<ShipmentStatus> ASSIGNED_STATUSES = List.of(
            ShipmentStatus.CREATED,
            ShipmentStatus.PENDING,
            ShipmentStatus.PICKED_UP,
            ShipmentStatus.IN_TRANSIT,
            ShipmentStatus.OUT_FOR_DELIVERY,
            ShipmentStatus.DELIVERY_FAILED);

    private static final List<ShipmentStatus> ACTIVE_STATUSES = List.of(
            ShipmentStatus.CREATED,
            ShipmentStatus.PENDING,
            ShipmentStatus.PICKED_UP,
            ShipmentStatus.IN_TRANSIT,
            ShipmentStatus.OUT_FOR_DELIVERY);

    private static final List<ShipmentStatus> PENDING_STATUSES = List.of(
            ShipmentStatus.CREATED,
            ShipmentStatus.PENDING);

    private static final List<ShipmentStatus> EXCLUDED_STATUSES = List.of(
            ShipmentStatus.DELIVERED,
            ShipmentStatus.CANCELLED);

    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final DeliveryConfirmationRepository deliveryConfirmationRepository;
    private final TrackingHistoryRepository trackingHistoryRepository;
    private final NotificationService notificationService;

    public DriverServiceImpl(
            ShipmentRepository shipmentRepository,
            UserRepository userRepository,
            DeliveryConfirmationRepository deliveryConfirmationRepository,
            TrackingHistoryRepository trackingHistoryRepository,
            NotificationService notificationService) {

        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
        this.deliveryConfirmationRepository = deliveryConfirmationRepository;
        this.trackingHistoryRepository = trackingHistoryRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public DriverDashboardOverviewResponse getOverview() {

        User driver = getCurrentDriver();
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();

        long assigned = shipmentRepository
                .countByDriverAndShipmentStatusNotIn(driver, EXCLUDED_STATUSES);

        long pending = shipmentRepository
                .countByDriverAndShipmentStatusIn(driver, PENDING_STATUSES);

        long inTransit = shipmentRepository
                .countByDriverAndShipmentStatus(driver, ShipmentStatus.IN_TRANSIT);

        long outForDelivery = shipmentRepository
                .countByDriverAndShipmentStatus(driver, ShipmentStatus.OUT_FOR_DELIVERY);

        long completedToday = deliveryConfirmationRepository
                .countByDriverAndDeliveryStatusAndDeliveryTimeBetween(
                        driver,
                        DeliveryConfirmationStatus.CONFIRMED,
                        startOfDay,
                        LocalDateTime.now());

        long completedDeliveries = deliveryConfirmationRepository
                .countByDriverAndDeliveryStatus(
                        driver,
                        DeliveryConfirmationStatus.CONFIRMED);

        long failedDeliveries = shipmentRepository
                .countByDriverAndShipmentStatus(driver, ShipmentStatus.DELIVERY_FAILED);

        long cancelledDeliveries = shipmentRepository
                .countByDriverAndShipmentStatus(driver, ShipmentStatus.CANCELLED);

        return DriverDashboardOverviewResponse.builder()
                .assignedShipments(assigned)
                .pendingDeliveries(pending)
                .inTransitCount(inTransit)
                .outForDeliveryCount(outForDelivery)
                .completedToday(completedToday)
                .todayDeliveryCount(completedToday)
                .completedDeliveries(completedDeliveries)
                .failedDeliveries(failedDeliveries)
                .cancelledDeliveries(cancelledDeliveries)
                .currentStatus(resolveCurrentStatus(driver))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverShipmentResponse> getAssignedShipments(String search) {

        User driver = getCurrentDriver();

        List<Shipment> shipments;

        if (search != null && !search.isBlank()) {
            shipments = shipmentRepository.searchDriverShipments(
                    driver, ASSIGNED_STATUSES, search.trim());
        } else {
            shipments = shipmentRepository.findByDriverAndShipmentStatusIn(
                    driver, ASSIGNED_STATUSES);
        }

        return shipments.stream()
                .map(this::toShipmentResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverShipmentResponse> getDeliveredShipments() {

        User driver = getCurrentDriver();

        return shipmentRepository
                .findByDriverAndShipmentStatusOrderByCreatedAtDesc(
                        driver, ShipmentStatus.DELIVERED)
                .stream()
                .map(this::toShipmentResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DriverShipmentResponse getShipmentDetails(Long shipmentId) {

        return toShipmentResponse(getOwnedShipment(shipmentId));
    }

    @Override
    @Transactional
    public DriverShipmentResponse updateShipmentStatus(Long shipmentId, DriverStatusUpdateRequest request) {

        if (request == null || request.getStatus() == null) {
            throw new RuntimeException("Shipment status is required.");
        }

        Shipment shipment = getOwnedShipment(shipmentId);
        ShipmentStatus targetStatus = request.getStatus();

        shipment.setShipmentStatus(targetStatus);
        shipment.setReachedDestination(targetStatus == ShipmentStatus.DELIVERED);

        if (targetStatus == ShipmentStatus.DELIVERY_FAILED) {
            shipment.setDeliveryFailureReason(request.getFailureReason());
        } else {
            shipment.setDeliveryFailureReason(null);
        }

        shipmentRepository.save(shipment);

        TrackingHistory trackingHistory = new TrackingHistory();
        trackingHistory.setStatus(targetStatus);
        trackingHistory.setLocation(shipment.getDestinationAddress() != null
                ? shipment.getDestinationAddress()
                : shipment.getReceiverAddress());
        trackingHistory.setRemarks(buildStatusRemarks(targetStatus, request.getFailureReason()));
        trackingHistory.setShipment(shipment);
        trackingHistoryRepository.save(trackingHistory);

        User customer = shipment.getCreatedBy();
        if (customer != null) {
            notificationService.createNotification(
                    "Shipment Update",
                    "Shipment " + shipment.getTrackingNumber()
                            + " is now " + formatStatus(targetStatus) + ".",
                    NotificationType.INFO,
                    customer);
        }

        return toShipmentResponse(shipment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverRouteHistoryResponse> getRouteHistory() {

        User driver = getCurrentDriver();

        return deliveryConfirmationRepository.findByDriver(driver)
                .stream()
                .sorted(Comparator.comparing(
                        DeliveryConfirmation::getDeliveryTime,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toRouteHistoryResponse)
                .toList();
    }

    private DriverRouteHistoryResponse toRouteHistoryResponse(DeliveryConfirmation confirmation) {

        Shipment shipment = confirmation.getShipment();

        long travelMinutes = 0;
        if (shipment.getCreatedAt() != null && confirmation.getDeliveryTime() != null) {
            travelMinutes = Math.max(0L,
                    Duration.between(shipment.getCreatedAt(), confirmation.getDeliveryTime()).toMinutes());
        }

        return DriverRouteHistoryResponse.builder()
                .shipmentId(shipment.getId())
                .trackingNumber(shipment.getTrackingNumber())
                .sourceAddress(shipment.getSourceAddress())
                .destinationAddress(shipment.getDestinationAddress())
                .receiverName(confirmation.getReceiverName())
                .travelDistanceKm(shipment.getDistanceKm())
                .travelTimeMinutes(travelMinutes)
                .deliveredAt(confirmation.getDeliveryTime())
                .build();
    }

    private DriverShipmentResponse toShipmentResponse(Shipment shipment) {

        DriverShipmentResponse response = new DriverShipmentResponse();
        response.setShipmentId(shipment.getId());
        response.setTrackingNumber(shipment.getTrackingNumber());
        response.setSenderName(shipment.getSenderName());
        response.setReceiverName(shipment.getReceiverName());
        response.setReceiverAddress(shipment.getReceiverAddress());
        response.setSourceAddress(shipment.getSourceAddress());
        response.setDestinationAddress(shipment.getDestinationAddress());
        response.setSourceLatitude(shipment.getSourceLatitude());
        response.setSourceLongitude(shipment.getSourceLongitude());
        response.setDestinationLatitude(shipment.getDestinationLatitude());
        response.setDestinationLongitude(shipment.getDestinationLongitude());
        response.setPackageWeight(shipment.getPackageWeight());
        response.setDistanceKm(shipment.getDistanceKm());
        response.setShipmentStatus(shipment.getShipmentStatus().name());
        response.setCreatedAt(shipment.getCreatedAt());
        response.setEstimatedDeliveryAt(shipment.getEstimatedDeliveryAt());
        response.setDelayMinutes(shipment.getDelayMinutes());
        response.setReachedDestination(shipment.getReachedDestination());
        response.setDeliveryFailureReason(shipment.getDeliveryFailureReason());

        User customer = shipment.getCreatedBy();
        if (customer != null) {
            response.setCustomerName(customer.getFullName());
            response.setCustomerPhone(
                    shipment.getCustomerPhone() != null
                            ? shipment.getCustomerPhone()
                            : customer.getPhone());
            response.setCustomerEmail(
                    shipment.getCustomerEmail() != null
                            ? shipment.getCustomerEmail()
                            : customer.getEmail());
        } else {
            response.setCustomerName(shipment.getSenderName());
            response.setCustomerPhone(shipment.getCustomerPhone());
            response.setCustomerEmail(shipment.getCustomerEmail());
        }

        return response;
    }

    private Shipment getOwnedShipment(Long shipmentId) {

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found."));

        User driver = getCurrentDriver();

        if (shipment.getDriver() == null
                || !shipment.getDriver().getId().equals(driver.getId())) {
            throw new RuntimeException("You are not assigned to this shipment.");
        }

        return shipment;
    }

    private User getCurrentDriver() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("User is not authenticated.");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Driver not found."));
    }

    private String resolveCurrentStatus(User driver) {

        List<Shipment> active = shipmentRepository.findByDriverAndShipmentStatusIn(driver, ACTIVE_STATUSES);

        if (active.isEmpty()) {
            return "Available";
        }

        for (Shipment shipment : active) {
            switch (shipment.getShipmentStatus()) {
                case OUT_FOR_DELIVERY -> {
                    return "Out for Delivery";
                }
                case IN_TRANSIT -> {
                    return "In Transit";
                }
                case PICKED_UP -> {
                    return "Picked Up";
                }
                default -> {
                }
            }
        }

        return "Assigned";
    }

    private String buildStatusRemarks(ShipmentStatus status, String failureReason) {

        if (status == ShipmentStatus.DELIVERY_FAILED) {
            return "Delivery failed"
                    + (failureReason == null || failureReason.isBlank()
                    ? ""
                    : ": " + failureReason.trim());
        }

        return "Driver marked shipment as " + status.name() + ".";
    }

    private String formatStatus(ShipmentStatus status) {

        return switch (status) {
            case PICKED_UP -> "Picked Up";
            case IN_TRANSIT -> "In Transit";
            case OUT_FOR_DELIVERY -> "Out for Delivery";
            case DELIVERED -> "Delivered";
            case DELIVERY_FAILED -> "Delivery Failed";
            default -> status.name();
        };
    }
}
