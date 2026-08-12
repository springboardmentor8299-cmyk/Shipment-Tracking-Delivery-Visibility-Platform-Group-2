package com.shiptrack.service;

import com.shiptrack.dto.NotificationDTO;
import com.shiptrack.dto.driver.DriverAdminResponse;
import com.shiptrack.dto.driver.DriverCreateRequest;
import com.shiptrack.dto.driver.DriverPerformanceResponse;
import com.shiptrack.dto.driver.DriverRouteHistoryResponse;
import com.shiptrack.dto.driver.DriverShipmentResponse;
import com.shiptrack.dto.driver.DriverUpdateRequest;
import com.shiptrack.dto.tracking.MapLocationResponse;
import com.shiptrack.entity.DeliveryConfirmation;
import com.shiptrack.entity.DeliveryConfirmationStatus;
import com.shiptrack.entity.DriverLocation;
import com.shiptrack.entity.Notification;
import com.shiptrack.entity.Role;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.ShipmentStatus;
import com.shiptrack.entity.User;
import com.shiptrack.repository.DeliveryConfirmationRepository;
import com.shiptrack.repository.DriverLocationRepository;
import com.shiptrack.repository.NotificationRepository;
import com.shiptrack.repository.RoleRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
public class DriverManagementService {

    private static final List<ShipmentStatus> ACTIVE_STATUSES = List.of(
            ShipmentStatus.CREATED,
            ShipmentStatus.PENDING,
            ShipmentStatus.PICKED_UP,
            ShipmentStatus.IN_TRANSIT,
            ShipmentStatus.OUT_FOR_DELIVERY);

    private static final List<ShipmentStatus> EXCLUDED_STATUSES = List.of(
            ShipmentStatus.DELIVERED,
            ShipmentStatus.CANCELLED);

    private static final List<ShipmentStatus> PENDING_STATUSES = List.of(
            ShipmentStatus.CREATED,
            ShipmentStatus.PENDING);

    private static final List<ShipmentStatus> IN_PROGRESS_STATUSES = List.of(
            ShipmentStatus.PICKED_UP,
            ShipmentStatus.IN_TRANSIT,
            ShipmentStatus.OUT_FOR_DELIVERY);

    private static final long ONLINE_WINDOW_MINUTES = 15L;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ShipmentRepository shipmentRepository;
    private final DeliveryConfirmationRepository deliveryConfirmationRepository;
    private final DriverLocationRepository driverLocationRepository;
    private final NotificationRepository notificationRepository;
    private final TrackingService trackingService;
    private final PasswordEncoder passwordEncoder;

    public DriverManagementService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            ShipmentRepository shipmentRepository,
            DeliveryConfirmationRepository deliveryConfirmationRepository,
            DriverLocationRepository driverLocationRepository,
            NotificationRepository notificationRepository,
            TrackingService trackingService,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.shipmentRepository = shipmentRepository;
        this.deliveryConfirmationRepository = deliveryConfirmationRepository;
        this.driverLocationRepository = driverLocationRepository;
        this.notificationRepository = notificationRepository;
        this.trackingService = trackingService;
        this.passwordEncoder = passwordEncoder;
    }

    private Role driverRole() {
        return roleRepository.findByName("ROLE_DRIVER")
                .orElseThrow(() -> new RuntimeException("ROLE_DRIVER role not found"));
    }

    private List<User> allDrivers() {
        return userRepository.findByRole(driverRole());
    }

    @Transactional(readOnly = true)
    public List<DriverAdminResponse> getDrivers(String search) {

        String query = search == null ? "" : search.trim().toLowerCase();

        return allDrivers().stream()
                .filter(driver -> query.isEmpty()
                        || (driver.getFullName() != null && driver.getFullName().toLowerCase().contains(query))
                        || (driver.getEmail() != null && driver.getEmail().toLowerCase().contains(query))
                        || (driver.getPhone() != null && driver.getPhone().toLowerCase().contains(query))
                        || (driver.getVehicleType() != null && driver.getVehicleType().toLowerCase().contains(query))
                        || (driver.getVehicleNumber() != null && driver.getVehicleNumber().toLowerCase().contains(query)))
                .sorted(Comparator.comparing(User::getFullName))
                .map(this::toAdminResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getDriverStats() {

        List<User> drivers = allDrivers();

        long total = drivers.size();
        long active = drivers.stream()
                .filter(driver -> Boolean.TRUE.equals(driver.getIsActive()))
                .count();
        long inactive = total - active;
        long busy = drivers.stream()
                .filter(driver -> Boolean.TRUE.equals(driver.getIsActive()))
                .filter(driver -> shipmentRepository
                        .countByDriverAndShipmentStatusNotIn(driver, EXCLUDED_STATUSES) > 0)
                .count();
        long available = active - busy;
        long online = drivers.stream()
                .filter(driver -> Boolean.TRUE.equals(driver.getIsActive()))
                .filter(this::isOnline)
                .count();
        long offline = active - online;

        return Map.of(
                "totalDrivers", total,
                "activeDrivers", active,
                "inactiveDrivers", inactive,
                "busyDrivers", busy,
                "availableDrivers", available,
                "onlineDrivers", online,
                "offlineDrivers", offline);
    }

    @Transactional
    public DriverAdminResponse addDriver(DriverCreateRequest request) {

        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new RuntimeException("Driver name is required.");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new RuntimeException("Driver email is required.");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("Driver password is required.");
        }

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("A user with this email already exists.");
        }

        User driver = new User();
        driver.setFullName(request.getFullName().trim());
        driver.setEmail(email);
        driver.setPhone(request.getPhone());
        driver.setPassword(passwordEncoder.encode(request.getPassword()));
        driver.setVehicleType(request.getVehicleType());
        driver.setVehicleNumber(request.getVehicleNumber());
        driver.setIsActive(true);
        driver.setRole(driverRole());

        return toAdminResponse(userRepository.save(driver));
    }

    @Transactional
    public DriverAdminResponse updateDriver(Long id, DriverUpdateRequest request) {

        User driver = getDriver(id);

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            driver.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            driver.setPhone(request.getPhone());
        }
        if (request.getVehicleType() != null) {
            driver.setVehicleType(request.getVehicleType());
        }
        if (request.getVehicleNumber() != null) {
            driver.setVehicleNumber(request.getVehicleNumber());
        }
        if (request.getIsActive() != null) {
            driver.setIsActive(request.getIsActive());
        }

        return toAdminResponse(userRepository.save(driver));
    }

    @Transactional
    public void setDriverActive(Long id, Boolean active) {

        User driver = getDriver(id);
        driver.setIsActive(Boolean.TRUE.equals(active));
        userRepository.save(driver);
    }

    @Transactional
    public void deleteDriver(Long id) {

        User driver = getDriver(id);

        long activeShipments = shipmentRepository
                .countByDriverAndShipmentStatusNotIn(driver, EXCLUDED_STATUSES);

        if (activeShipments > 0) {
            throw new RuntimeException(
                    "Cannot delete a driver with active shipments. Deactivate the driver instead.");
        }

        driverLocationRepository.deleteByDriver(driver);
        deliveryConfirmationRepository.deleteByDriver(driver);

        List<Shipment> driverShipments = shipmentRepository.findByDriver(driver);
        for (Shipment shipment : driverShipments) {
            shipment.setDriver(null);
        }
        shipmentRepository.saveAll(driverShipments);

        userRepository.delete(driver);
    }

    @Transactional(readOnly = true)
    public DriverPerformanceResponse getDriverPerformance(Long id) {

        User driver = getDriver(id);

        long total = shipmentRepository.findByDriver(driver).size();
        long completed = deliveryConfirmationRepository
                .countByDriverAndDeliveryStatus(driver, DeliveryConfirmationStatus.CONFIRMED);
        long failed = shipmentRepository
                .countByDriverAndShipmentStatus(driver, ShipmentStatus.DELIVERY_FAILED);
        long cancelled = shipmentRepository
                .countByDriverAndShipmentStatus(driver, ShipmentStatus.CANCELLED);
        long pending = shipmentRepository
                .countByDriverAndShipmentStatusIn(driver, PENDING_STATUSES);
        long inProgress = shipmentRepository
                .countByDriverAndShipmentStatusIn(driver, IN_PROGRESS_STATUSES);
        long completedToday = deliveryConfirmationRepository
                .countByDriverAndDeliveryStatusAndDeliveryTimeBetween(
                        driver,
                        DeliveryConfirmationStatus.CONFIRMED,
                        LocalDate.now().atStartOfDay(),
                        LocalDateTime.now());

        List<DeliveryConfirmation> confirmations = deliveryConfirmationRepository
                .findByDriverOrderByDeliveryTimeDesc(driver);

        long onTime = 0;
        long totalMinutes = 0;
        double totalDistance = 0.0;

        for (DeliveryConfirmation confirmation : confirmations) {
            Shipment shipment = confirmation.getShipment();
            if (shipment != null) {
                if (shipment.getDistanceKm() != null) {
                    totalDistance += shipment.getDistanceKm();
                }
                if (shipment.getCreatedAt() != null && confirmation.getDeliveryTime() != null) {
                    totalMinutes += Math.max(0L,
                            Duration.between(shipment.getCreatedAt(), confirmation.getDeliveryTime()).toMinutes());
                }
                if (shipment.getEstimatedDeliveryAt() != null
                        && confirmation.getDeliveryTime() != null
                        && !confirmation.getDeliveryTime().isAfter(shipment.getEstimatedDeliveryAt())) {
                    onTime++;
                }
            }
        }

        long confirmationCount = confirmations.size();
        double onTimeRate = confirmationCount == 0 ? 0.0
                : Math.round((onTime * 100.0) / confirmationCount);
        long avgMinutes = confirmationCount == 0 ? 0L
                : Math.round((double) totalMinutes / confirmationCount);

        return DriverPerformanceResponse.builder()
                .driverId(driver.getId())
                .driverName(driver.getFullName())
                .totalShipments(total)
                .completedDeliveries(completed)
                .failedDeliveries(failed)
                .cancelled(cancelled)
                .pending(pending)
                .inProgress(inProgress)
                .completedToday(completedToday)
                .onTimeRate(onTimeRate)
                .avgDeliveryMinutes(avgMinutes)
                .totalDistanceKm(Math.round(totalDistance * 100.0) / 100.0)
                .build();
    }

    @Transactional(readOnly = true)
    public List<DriverShipmentResponse> getDriverShipments(Long id) {

        User driver = getDriver(id);

        return shipmentRepository.findByDriver(driver).stream()
                .sorted(Comparator.comparing(Shipment::getCreatedAt).reversed())
                .map(this::toShipmentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DriverRouteHistoryResponse> getDriverRouteHistory(Long id) {

        User driver = getDriver(id);

        return deliveryConfirmationRepository.findByDriver(driver).stream()
                .sorted(Comparator.comparing(
                        DeliveryConfirmation::getDeliveryTime,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toRouteHistoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MapLocationResponse> getDriverLocations() {

        return trackingService.getAllDriverLocations();
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getDriverNotifications() {

        List<NotificationDTO> result = new ArrayList<>();

        for (User driver : allDrivers()) {
            for (Notification notification : notificationRepository.findByUserOrderByCreatedAtDesc(driver)) {
                result.add(new NotificationDTO(
                        notification.getId(),
                        notification.getTitle(),
                        notification.getMessage(),
                        notification.getType(),
                        notification.isRead(),
                        notification.getCreatedAt(),
                        notification.getSenderName()));
            }
        }

        return result.stream()
                .sorted(Comparator.comparing(
                        NotificationDTO::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(100)
                .toList();
    }

    private User getDriver(Long id) {

        User driver = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found."));

        if (driver.getRole() == null
                || !"ROLE_DRIVER".equals(driver.getRole().getName())) {
            throw new RuntimeException("User is not a driver.");
        }

        return driver;
    }

    private boolean isOnline(User driver) {

        return driverLocationRepository.findByDriver(driver)
                .map(location -> location.getLastUpdated() != null
                        && location.getLastUpdated()
                        .isAfter(LocalDateTime.now().minusMinutes(ONLINE_WINDOW_MINUTES)))
                .orElse(false);
    }

    private String resolveStatus(User driver) {

        if (!Boolean.TRUE.equals(driver.getIsActive())) {
            return "Inactive";
        }

        List<Shipment> active = shipmentRepository
                .findByDriverAndShipmentStatusIn(driver, ACTIVE_STATUSES);

        if (active.isEmpty()) {
            return isOnline(driver) ? "Available" : "Offline";
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

        return "Busy";
    }

    private DriverAdminResponse toAdminResponse(User driver) {

        DriverLocation location = driverLocationRepository.findByDriver(driver).orElse(null);

        return DriverAdminResponse.builder()
                .driverId(driver.getId())
                .fullName(driver.getFullName())
                .email(driver.getEmail())
                .phone(driver.getPhone())
                .isActive(driver.getIsActive())
                .roleName(driver.getRole() == null ? null : driver.getRole().getName())
                .vehicleType(driver.getVehicleType())
                .vehicleNumber(driver.getVehicleNumber())
                .status(resolveStatus(driver))
                .activeShipments(shipmentRepository
                        .countByDriverAndShipmentStatusNotIn(driver, EXCLUDED_STATUSES))
                .completedDeliveries(deliveryConfirmationRepository
                        .countByDriverAndDeliveryStatus(driver, DeliveryConfirmationStatus.CONFIRMED))
                .latitude(location == null ? null : location.getLatitude())
                .longitude(location == null ? null : location.getLongitude())
                .lastLocationUpdate(location == null ? null : location.getLastUpdated())
                .createdAt(driver.getCreatedAt())
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
}
