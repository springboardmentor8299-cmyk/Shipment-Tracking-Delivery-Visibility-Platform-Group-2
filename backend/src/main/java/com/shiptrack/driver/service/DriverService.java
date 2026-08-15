package com.shiptrack.driver.service;

import java.security.SecureRandom;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shiptrack.admin.shipment.dto.StatusUpdateRequest;
import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.entity.ShipmentStatus;
import com.shiptrack.admin.shipment.repository.ShipmentRepository;
import com.shiptrack.admin.shipment.service.ShipmentService;
import com.shiptrack.auth.entity.Role;
import com.shiptrack.auth.entity.User;
import com.shiptrack.auth.repository.UserRepository;
import com.shiptrack.auth.service.EmailService;
import com.shiptrack.driver.dto.AssignShipmentRequest;
import com.shiptrack.driver.dto.ChangePasswordRequest;
import com.shiptrack.driver.dto.DriverRequest;
import com.shiptrack.driver.dto.DriverResponse;
import com.shiptrack.driver.dto.DriverShipmentResponse;
import com.shiptrack.driver.dto.DriverStatusUpdateRequest;
import com.shiptrack.driver.dto.ShipmentBrief;
import com.shiptrack.driver.entity.Driver;
import com.shiptrack.driver.entity.DriverStatus;
import com.shiptrack.driver.repository.DriverRepository;
import com.shiptrack.notification.entity.NotificationType;
import com.shiptrack.notification.service.NotificationService;

@Service
public class DriverService {

    // A driver is considered to still need attention (i.e. is "unassigned"
    // eligible) as long as it isn't in one of these terminal states.
    private static final List<ShipmentStatus> TERMINAL_STATUSES = List.of(
            ShipmentStatus.DELIVERED,
            ShipmentStatus.CANCELLED,
            ShipmentStatus.FAILED_DELIVERY);

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final ShipmentRepository shipmentRepository;
    private final ShipmentService shipmentService;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public DriverService(
            DriverRepository driverRepository,
            UserRepository userRepository,
            ShipmentRepository shipmentRepository,
            ShipmentService shipmentService,
            PasswordEncoder passwordEncoder,
            NotificationService notificationService,
            EmailService emailService) {

        this.driverRepository = driverRepository;
        this.userRepository = userRepository;
        this.shipmentRepository = shipmentRepository;
        this.shipmentService = shipmentService;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    // ================= Reads =================

    @Transactional
    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Shipment> getUnassignedShipments() {
        return shipmentRepository.findByAssignedDriverIsNullAndStatusNotIn(TERMINAL_STATUSES);
    }

    // ================= Create / Update / Delete =================

    @Transactional
    public DriverResponse createDriver(DriverRequest request) {

        validate(request);

        if (userRepository.existsByUsername(request.getEmail())) {
            throw new RuntimeException("A user with this email already exists");
        }

        if (driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new RuntimeException("A driver with this license number already exists");
        }

        String temporaryPassword = generateTemporaryPassword();

        User user = User.builder()
                .name(request.getName())
                .username(request.getEmail())
                .password(passwordEncoder.encode(temporaryPassword))
                .phoneNumber(request.getPhone())
                .role(Role.DRIVER)
                .build();

        user = userRepository.save(user);

        Driver driver = Driver.builder()
                .user(user)
                .licenseNumber(request.getLicenseNumber())
                .vehicleType(request.getVehicleType())
                .vehicleNumber(request.getVehicleNumber())
                .status(DriverStatus.AVAILABLE)
                .build();

        driver = driverRepository.save(driver);

        // Best-effort — the driver account already exists even if the email fails.
        try {
            emailService.sendNotificationEmail(
                    user.getUsername(),
                    "Your ShipTrack driver account is ready",
                    "Hi " + user.getName() + ", you've been added as a driver. "
                            + "Login with email: " + user.getUsername()
                            + " and temporary password: " + temporaryPassword
                            + ". Please change your password after logging in.");
        } catch (Exception ignored) {
        }

        DriverResponse response = toResponse(driver);
        response.setTemporaryPassword(temporaryPassword);
        return response;
    }

    @Transactional
    public DriverResponse updateDriver(Long id, DriverRequest request) {

        validate(request);

        Driver driver = getDriverOrThrow(id);
        User user = driver.getUser();

        if (request.getEmail() != null
                && !request.getEmail().equalsIgnoreCase(user.getUsername())
                && userRepository.existsByUsername(request.getEmail())) {
            throw new RuntimeException("A user with this email already exists");
        }

        user.setName(request.getName());
        user.setPhoneNumber(request.getPhone());
        user.setUsername(request.getEmail());
        userRepository.save(user);

        driver.setLicenseNumber(request.getLicenseNumber());
        driver.setVehicleType(request.getVehicleType());
        driver.setVehicleNumber(request.getVehicleNumber());

        return toResponse(driverRepository.save(driver));
    }

    @Transactional
    public void deleteDriver(Long id) {

        Driver driver = getDriverOrThrow(id);

        if (driver.getStatus() == DriverStatus.ON_DELIVERY) {
            throw new RuntimeException(
                    "Cannot remove a driver who currently has an active shipment. Unassign it first.");
        }

        // Detach this driver from any past shipments (e.g. delivered ones)
        // so the foreign key doesn't block deletion. The shipment record
        // itself is untouched — only the driver attribution is cleared.
        shipmentRepository.findByAssignedDriver_Id(driver.getId())
                .forEach(s -> s.setAssignedDriver(null));

        Long userId = driver.getUser().getId();
        driverRepository.delete(driver);
        userRepository.deleteById(userId);
    }

    // ================= Assignment =================

    @Transactional
    public Shipment assignShipmentToDriver(Long shipmentId, AssignShipmentRequest request) {

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        if (shipment.getAssignedDriver() != null) {
            throw new RuntimeException("Shipment is already assigned to a driver");
        }

        Driver driver = getDriverOrThrow(request.getDriverId());

        if (driver.getStatus() == DriverStatus.OFFLINE) {
            throw new RuntimeException("Driver is offline and cannot be assigned a shipment");
        }

        // Capacity depends on the driver's vehicle: BIKE 10, VAN 20,
        // MINI_TRUCK 30, TRUCK 50 concurrent (non-terminal) shipments.
        long activeCount = shipmentRepository.findByAssignedDriver_Id(driver.getId())
                .stream()
                .filter(s -> !TERMINAL_STATUSES.contains(s.getStatus()))
                .count();

        int capacity = driver.getVehicleType().getMaxShipmentCapacity();

        if (activeCount >= capacity) {
            throw new RuntimeException(
                    "Driver is at full capacity (" + capacity + " active shipments for a "
                            + driver.getVehicleType() + "). Unassign one first or choose another driver.");
        }

        shipment.setAssignedDriver(driver);
        driver.setStatus(DriverStatus.ON_DELIVERY);
        driverRepository.save(driver);

        Shipment saved = shipmentRepository.save(shipment);

        try {
            notificationService.notify(
                    driver.getUser(),
                    NotificationType.SHIPMENT_UPDATE,
                    "New delivery assigned: " + saved.getTrackingId(),
                    "You've been assigned shipment " + saved.getTrackingId() + " from "
                            + saved.getOrigin() + " to " + saved.getDestination() + ".",
                    saved.getTrackingId());
        } catch (Exception ignored) {
        }

        return saved;
    }

    @Transactional
    public Shipment unassignShipmentFromDriver(Long shipmentId) {

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        Driver driver = shipment.getAssignedDriver();
        if (driver == null) {
            throw new RuntimeException("Shipment has no driver assigned");
        }

        shipment.setAssignedDriver(null);
        Shipment saved = shipmentRepository.save(shipment);

        // Only go back to AVAILABLE if the driver has no other active shipment.
        boolean hasOtherActiveShipment = shipmentRepository
                .findByAssignedDriver_Id(driver.getId())
                .stream()
                .anyMatch(s -> !s.getId().equals(saved.getId())
                        && !TERMINAL_STATUSES.contains(s.getStatus()));

        if (!hasOtherActiveShipment) {
            driver.setStatus(DriverStatus.AVAILABLE);
            driverRepository.save(driver);
        }

        return saved;
    }

    // ================= Driver Portal (self-service) =================

    @Transactional
    public DriverResponse getMyProfile(String username) {
        return toResponse(getDriverByUsernameOrThrow(username));
    }

    // Returns every shipment currently assigned to this driver that hasn't
    // reached a terminal status yet -- a driver can now hold several at once
    // (up to their vehicle's capacity), not just one.
    @Transactional(readOnly = true)
    public List<DriverShipmentResponse> getMyActiveShipments(String username) {
        Driver driver = getDriverByUsernameOrThrow(username);

        return shipmentRepository.findByAssignedDriver_Id(driver.getId())
                .stream()
                .filter(s -> !TERMINAL_STATUSES.contains(s.getStatus()))
                .map(this::toShipmentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DriverShipmentResponse> getMyHistory(String username) {
        Driver driver = getDriverByUsernameOrThrow(username);

        return shipmentRepository.findByAssignedDriver_Id(driver.getId())
                .stream()
                .filter(s -> TERMINAL_STATUSES.contains(s.getStatus()))
                .sorted((a, b) -> {
                    if (a.getDeliveryDate() == null)
                        return 1;
                    if (b.getDeliveryDate() == null)
                        return -1;
                    return b.getDeliveryDate().compareTo(a.getDeliveryDate());
                })
                .map(this::toShipmentResponse)
                .toList();
    }

    // trackingId picks which of the driver's (possibly several) active
    // shipments this update applies to.
    @Transactional
    public DriverShipmentResponse updateMyShipmentStatus(String username, String trackingId,
            StatusUpdateRequest request) {
        Driver driver = getDriverByUsernameOrThrow(username);

        Shipment shipment = shipmentRepository.findByAssignedDriver_Id(driver.getId())
                .stream()
                .filter(s -> !TERMINAL_STATUSES.contains(s.getStatus()))
                .filter(s -> s.getTrackingId().equals(trackingId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                        "You don't have an active shipment " + trackingId + " assigned right now"));

        if (request.getStatus() == null) {
            throw new RuntimeException("Status is required");
        }

        Shipment updated = shipmentService.updateShipmentStatus(shipment.getTrackingId(), request);

        // Once a job reaches a terminal state, free the driver up again
        // (unless they somehow have another active job already).
        if (TERMINAL_STATUSES.contains(updated.getStatus())) {
            boolean hasOtherActiveShipment = shipmentRepository
                    .findByAssignedDriver_Id(driver.getId())
                    .stream()
                    .anyMatch(s -> !s.getId().equals(updated.getId())
                            && !TERMINAL_STATUSES.contains(s.getStatus()));

            if (!hasOtherActiveShipment) {
                driver.setStatus(DriverStatus.AVAILABLE);
                driverRepository.save(driver);
            }
        }

        return toShipmentResponse(updated);
    }

    @Transactional
    public DriverResponse updateMyStatus(String username, DriverStatusUpdateRequest request) {
        Driver driver = getDriverByUsernameOrThrow(username);

        if (request.getStatus() == null) {
            throw new RuntimeException("Status is required");
        }

        if (driver.getStatus() == DriverStatus.ON_DELIVERY) {
            throw new RuntimeException(
                    "You have an active shipment in progress. Your status will free up automatically once it's completed.");
        }

        if (request.getStatus() == DriverStatus.ON_DELIVERY) {
            throw new RuntimeException(
                    "ON_DELIVERY is set automatically when a shipment is assigned to you and can't be chosen manually.");
        }

        driver.setStatus(request.getStatus());
        return toResponse(driverRepository.save(driver));
    }

    @Transactional
    public void changeMyPassword(String username, ChangePasswordRequest request) {
        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            throw new RuntimeException("Current password is required");
        }
        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            throw new RuntimeException("New password is required");
        }
        if (request.getNewPassword().length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // ================= Helpers =================

    private Driver getDriverByUsernameOrThrow(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return driverRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new RuntimeException("No driver profile linked to this account"));
    }

    private DriverShipmentResponse toShipmentResponse(Shipment shipment) {
        return DriverShipmentResponse.builder()
                .id(shipment.getId())
                .trackingId(shipment.getTrackingId())
                .customerName(shipment.getCustomerName())
                .receiverName(shipment.getReceiverName())
                .origin(shipment.getOrigin())
                .destination(shipment.getDestination())
                .status(shipment.getStatus())
                .noOfItems(shipment.getNoOfItems())
                .totalWeightOfItems(shipment.getTotalWeightOfItems())
                .shipmentDate(shipment.getShipmentDate())
                .deliveryDate(shipment.getDeliveryDate())
                .currentLocationName(shipment.getCurrentLocationName())
                .estimatedDeliveryTime(shipment.getEstimatedDeliveryTime())
                .build();
    }

    private Driver getDriverOrThrow(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
    }

    private void validate(DriverRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Driver name is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new RuntimeException("Driver email is required (used as their login)");
        }
        if (request.getPhone() == null || request.getPhone().isBlank()) {
            throw new RuntimeException("Driver phone number is required");
        }
        if (request.getLicenseNumber() == null || request.getLicenseNumber().isBlank()) {
            throw new RuntimeException("License number is required");
        }
        if (request.getVehicleType() == null) {
            throw new RuntimeException("Vehicle type is required");
        }
        if (request.getVehicleNumber() == null || request.getVehicleNumber().isBlank()) {
            throw new RuntimeException("Vehicle number is required");
        }
    }

    private String generateTemporaryPassword() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder("Drv-");
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private DriverResponse toResponse(Driver driver) {

        List<Shipment> active = shipmentRepository.findByAssignedDriver_Id(driver.getId())
                .stream()
                .filter(s -> !TERMINAL_STATUSES.contains(s.getStatus()))
                .toList();

        // Self-heals any driver stuck on ON_DELIVERY with no active
        // shipment (e.g. from a shipment that reached DELIVERED before
        // this reconciliation existed) the next time they're read.
        if (active.isEmpty() && driver.getStatus() == DriverStatus.ON_DELIVERY) {
            driver.setStatus(DriverStatus.AVAILABLE);
            driver = driverRepository.save(driver);
        }

        List<ShipmentBrief> activeShipments = active.stream()
                .map(this::toBrief)
                .toList();

        long totalDelivered = shipmentRepository.countByAssignedDriver_IdAndStatus(
                driver.getId(), ShipmentStatus.DELIVERED);

        return DriverResponse.builder()
                .id(driver.getId())
                .name(driver.getUser().getName())
                .phone(driver.getUser().getPhoneNumber())
                .email(driver.getUser().getUsername())
                .licenseNumber(driver.getLicenseNumber())
                .vehicleType(driver.getVehicleType())
                .vehicleNumber(driver.getVehicleNumber())
                .status(driver.getStatus())
                .activeShipments(activeShipments)
                .shipmentCapacity(driver.getVehicleType().getMaxShipmentCapacity())
                .activeShipmentCount(activeShipments.size())
                .totalDelivered(totalDelivered)
                .createdAt(driver.getCreatedAt())
                .build();
    }

    private ShipmentBrief toBrief(Shipment shipment) {
        return ShipmentBrief.builder()
                .id(shipment.getId())
                .trackingId(shipment.getTrackingId())
                .origin(shipment.getOrigin())
                .destination(shipment.getDestination())
                .status(shipment.getStatus())
                .build();
    }
}