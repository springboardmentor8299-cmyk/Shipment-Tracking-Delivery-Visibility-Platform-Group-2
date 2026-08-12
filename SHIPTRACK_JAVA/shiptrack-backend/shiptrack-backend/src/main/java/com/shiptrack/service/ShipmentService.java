package com.shiptrack.service;

import com.shiptrack.dto.MonthlyShipmentTrendDTO;
import com.shiptrack.dto.CreateShipmentRequest;
import com.shiptrack.dto.DailyShipmentCountDTO;
import com.shiptrack.dto.TopCustomerDTO;
import com.shiptrack.dto.driver.DriverPerformanceResponse;
import com.shiptrack.entity.DeliveryConfirmation;
import com.shiptrack.entity.DeliveryConfirmationStatus;
import com.shiptrack.entity.NotificationType;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.ShipmentStatus;
import com.shiptrack.entity.TrackingHistory;
import com.shiptrack.entity.User;
import com.shiptrack.repository.DeliveryConfirmationRepository;
import com.shiptrack.repository.ProofOfDeliveryRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.TrackingHistoryRepository;
import com.shiptrack.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Duration;
import java.time.LocalDate;
import java.time.Month;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ShipmentService {

    private static final List<ShipmentStatus> ACTIVE_STATUSES = List.of(
            ShipmentStatus.CREATED,
            ShipmentStatus.PENDING,
            ShipmentStatus.PICKED_UP,
            ShipmentStatus.IN_TRANSIT,
            ShipmentStatus.OUT_FOR_DELIVERY);

    private final ShipmentRepository shipmentRepository;
    private final TrackingHistoryRepository trackingHistoryRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final DeliveryConfirmationRepository deliveryConfirmationRepository;
    private final ProofOfDeliveryRepository proofOfDeliveryRepository;

    public ShipmentService(
            ShipmentRepository shipmentRepository,
            TrackingHistoryRepository trackingHistoryRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            DeliveryConfirmationRepository deliveryConfirmationRepository,
            ProofOfDeliveryRepository proofOfDeliveryRepository) {

        this.shipmentRepository = shipmentRepository;
        this.trackingHistoryRepository = trackingHistoryRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.deliveryConfirmationRepository = deliveryConfirmationRepository;
        this.proofOfDeliveryRepository = proofOfDeliveryRepository;
    }

    public Shipment createShipment(CreateShipmentRequest request) {

        User customer = userRepository.findByEmail(
                request.getCustomerEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Shipment shipment = new Shipment();
        shipment.setCreatedBy(customer);
        shipment.setCustomerPhone(
                request.getCustomerPhone() != null && !request.getCustomerPhone().isBlank()
                        ? request.getCustomerPhone()
                        : customer.getPhone());
        shipment.setCustomerEmail(
                request.getCustomerEmail() != null && !request.getCustomerEmail().isBlank()
                        ? request.getCustomerEmail()
                        : customer.getEmail());
        shipment.setSenderName(request.getSenderName());
        shipment.setReceiverName(request.getReceiverName());
        shipment.setReceiverAddress(request.getDestinationAddress());
        shipment.setSourceAddress(request.getSourceAddress());
        shipment.setDestinationAddress(request.getDestinationAddress());
        shipment.setSourceLatitude(request.getSourceLatitude());
        shipment.setSourceLongitude(request.getSourceLongitude());
        shipment.setDestinationLatitude(request.getDestinationLatitude());
        shipment.setDestinationLongitude(request.getDestinationLongitude());
        shipment.setPackageWeight(request.getPackageWeight());
        shipment.setShipmentStatus(request.getShipmentStatus());

        return saveNewShipment(shipment);
    }

    public Shipment createShipment(Shipment shipment) {
        return saveNewShipment(shipment);
    }

    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    public List<Shipment> getMyShipments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("User not authenticated");
        }

        User customer = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return shipmentRepository.findByCreatedBy(customer);
    }

    public Shipment getShipmentById(Long id) {

        return shipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found"));
    }

    @Transactional
    public void deleteShipment(Long id) {
        if (!shipmentRepository.existsById(id)) {
            throw new RuntimeException("Shipment not found");
        }

        shipmentRepository.deleteTrackingHistoryByShipmentIdNative(id);
        shipmentRepository.deleteByIdNative(id);
    }

    @Transactional
    public int fixShipmentStatusTypos() {
        return shipmentRepository.fixDeliveredStatusTypos();
    }

    @Transactional
    public void deleteAllShipments() {
        shipmentRepository.deleteAllTrackingHistoryNative();
        shipmentRepository.deleteAllNative();
    }

    @Transactional
    public Shipment assignDriver(Long shipmentId, Long driverId) {

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));

        User previousDriver = shipment.getDriver();
        User newDriver = null;

        if (driverId != null) {
            newDriver = userRepository.findById(driverId)
                    .orElseThrow(() -> new RuntimeException("Driver not found"));

            if (newDriver.getRole() == null
                    || !"ROLE_DRIVER".equals(newDriver.getRole().getName())) {
                throw new RuntimeException("Selected user is not a driver");
            }
        }

        shipment.setDriver(newDriver);

        if (newDriver != null
                && (previousDriver == null
                || !previousDriver.getId().equals(newDriver.getId()))) {

            notificationService.createNotification(
                    "New Shipment Assigned",
                    "Shipment " + shipment.getTrackingNumber()
                            + " (ID " + shipment.getId() + ") has been assigned to you. "
                            + "Open the Driver Dashboard to view the delivery.",
                    NotificationType.INFO,
                    newDriver);
        }

        return shipmentRepository.save(shipment);
    }

    public Shipment updateShipment(Long id, Shipment updatedShipment) {

        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found"));

        ShipmentStatus oldStatus = shipment.getShipmentStatus();

        shipment.setTrackingNumber(updatedShipment.getTrackingNumber());
        shipment.setSenderName(updatedShipment.getSenderName());
        shipment.setReceiverName(updatedShipment.getReceiverName());
        shipment.setReceiverAddress(updatedShipment.getReceiverAddress());
        shipment.setSourceAddress(updatedShipment.getSourceAddress());
        shipment.setDestinationAddress(updatedShipment.getDestinationAddress());
        shipment.setSourceLatitude(updatedShipment.getSourceLatitude());
        shipment.setSourceLongitude(updatedShipment.getSourceLongitude());
        shipment.setDestinationLatitude(updatedShipment.getDestinationLatitude());
        shipment.setDestinationLongitude(updatedShipment.getDestinationLongitude());
        shipment.setPackageWeight(updatedShipment.getPackageWeight());
        shipment.setShipmentStatus(updatedShipment.getShipmentStatus());
        shipment.setReachedDestination(
                updatedShipment.getShipmentStatus() == ShipmentStatus.DELIVERED);

        if (updatedShipment.getShipmentStatus() == ShipmentStatus.DELIVERY_FAILED) {
            shipment.setDeliveryFailureReason(updatedShipment.getDeliveryFailureReason());
        } else {
            shipment.setDeliveryFailureReason(null);
        }

        User previousDriver = shipment.getDriver();
        User newDriver = resolveDriver(updatedShipment.getDriver());
        shipment.setDriver(newDriver);

        if (newDriver != null
                && (previousDriver == null
                || !previousDriver.getId().equals(newDriver.getId()))) {

            notificationService.createNotification(
                    "New Shipment Assigned",
                    "Shipment " + shipment.getTrackingNumber()
                            + " (ID " + shipment.getId() + ") has been assigned to you. "
                            + "Open the Driver Dashboard to view the delivery.",
                    NotificationType.INFO,
                    newDriver);
        }

        Shipment savedShipment = shipmentRepository.save(shipment);
        applyEta(savedShipment);

        if (oldStatus != updatedShipment.getShipmentStatus()) {

            TrackingHistory trackingHistory = new TrackingHistory();

            trackingHistory.setStatus(
                    updatedShipment.getShipmentStatus());

            trackingHistory.setLocation("System Update");

            trackingHistory.setRemarks(
                    "Status changed to "
                            + updatedShipment.getShipmentStatus().name());

            trackingHistory.setShipment(savedShipment);

            trackingHistoryRepository.save(trackingHistory);
        }

        return savedShipment;
    }

    private User resolveDriver(User driverReference) {
        if (driverReference == null || driverReference.getId() == null) {
            return null;
        }
        return userRepository.findById(driverReference.getId())
                .orElseThrow(() -> new RuntimeException("Assigned driver not found."));
    }

    private void applyEta(Shipment shipment) {
        double distanceKm = 0.0;
        if (shipment.getSourceLatitude() != null && shipment.getSourceLongitude() != null
                && shipment.getDestinationLatitude() != null && shipment.getDestinationLongitude() != null) {
            distanceKm = com.shiptrack.util.GoogleMapUtil.calculateDistance(
                    shipment.getSourceLatitude(),
                    shipment.getSourceLongitude(),
                    shipment.getDestinationLatitude(),
                    shipment.getDestinationLongitude());
        }
        shipment.setDistanceKm(distanceKm);

        double speed = distanceKm > 250 ? 45.0 : 35.0;
        long etaMinutes = Math.max(1L, Math.round(
                com.shiptrack.util.GoogleMapUtil.calculateEta(distanceKm, speed) * 60.0));
        shipment.setEstimatedMinutes(etaMinutes);
        shipment.setEstimatedDeliveryAt(shipment.getCreatedAt().plusMinutes(etaMinutes));

        long elapsedMinutes = Math.max(0L, java.time.Duration.between(shipment.getCreatedAt(), LocalDateTime.now()).toMinutes());
        shipment.setDelayMinutes(Math.max(0L, elapsedMinutes - etaMinutes));
        if (shipment.getShipmentStatus() == ShipmentStatus.DELIVERED) {
            shipment.setReachedDestination(true);
            shipment.setDelayMinutes(0L);
        }
    }

    private Shipment saveNewShipment(Shipment shipment) {
        long nextSequence = shipmentRepository.findTopByOrderByIdDesc()
                .map(Shipment::getId)
                .orElse(0L) + 1;

        Shipment savedShipment = null;

        for (int attempt = 0; attempt < 10; attempt++) {

            String trackingNumber = String.format(
                    "SHIP2026%04d",
                    nextSequence + attempt);

            if (shipmentRepository.existsByTrackingNumber(trackingNumber)) {
                continue;
            }

            shipment.setTrackingNumber(trackingNumber);

            try {
                savedShipment = shipmentRepository.save(shipment);
                break;
            } catch (DataIntegrityViolationException ex) {
                
            }
        }

        if (savedShipment == null) {
            throw new RuntimeException(
                    "Could not generate a unique tracking number. Please try again.");
        }

        TrackingHistory trackingHistory = new TrackingHistory();
        trackingHistory.setStatus(savedShipment.getShipmentStatus());
        trackingHistory.setLocation(savedShipment.getSourceAddress());
        trackingHistory.setRemarks("Shipment Created Successfully");
        trackingHistory.setShipment(savedShipment);

        trackingHistoryRepository.save(trackingHistory);

        applyEta(savedShipment);
        shipmentRepository.save(savedShipment);

        return savedShipment;
    }

    public Shipment getShipmentByTrackingNumber(String trackingNumber) {

        return shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found"));
    }

    public long getTotalShipments() {
        return shipmentRepository.count();
    }

    public long getCreatedShipments() {
        return shipmentRepository.countByShipmentStatus(
                ShipmentStatus.CREATED);
    }

    public long getPendingShipments() {
        return shipmentRepository.countByShipmentStatus(
                ShipmentStatus.PENDING);
    }

    public long getPickedUpShipments() {
        return shipmentRepository.countByShipmentStatus(
                ShipmentStatus.PICKED_UP);
    }

    public long getActiveShipments() {
        return shipmentRepository.countByShipmentStatusIn(ACTIVE_STATUSES);
    }

    public long getActiveDrivers() {
        return shipmentRepository.countDistinctDriversOnStatuses(ACTIVE_STATUSES);
    }

    public long getInTransitShipments() {
        return shipmentRepository.countByShipmentStatus(
                ShipmentStatus.IN_TRANSIT);
    }

    public long getOutForDeliveryShipments() {
        return shipmentRepository.countByShipmentStatus(
                ShipmentStatus.OUT_FOR_DELIVERY);
    }

    public long getDeliveredShipments() {
        return shipmentRepository.countByShipmentStatus(
                ShipmentStatus.DELIVERED);
    }

    public long getCancelledShipments() {
        return shipmentRepository.countByShipmentStatus(
                ShipmentStatus.CANCELLED);
    }

    public long getDeliveriesToday() {
        return deliveryConfirmationRepository
                .countByDeliveryStatusAndDeliveryTimeBetween(
                        DeliveryConfirmationStatus.CONFIRMED,
                        LocalDate.now().atStartOfDay(),
                        LocalDate.now().plusDays(1).atStartOfDay());
    }

    public long getDeliveryFailedShipments() {
        return shipmentRepository.countByShipmentStatus(
                ShipmentStatus.DELIVERY_FAILED);
    }

    public long getPodsGeneratedToday() {
        return proofOfDeliveryRepository.countByCreatedAtBetween(
                LocalDate.now().atStartOfDay(),
                LocalDate.now().plusDays(1).atStartOfDay());
    }

    public long getDeliverySuccessRate() {
        long delivered = getDeliveredShipments();
        long failed = getDeliveryFailedShipments();
        if (delivered == 0) {
            return 0L;
        }
        return Math.round(delivered * 100.0 / (delivered + failed));
    }

    public List<MonthlyShipmentTrendDTO> getMonthlyShipmentTrend() {

        Map<Month, Long> monthlyData = shipmentRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        shipment -> shipment.getCreatedAt().getMonth(),
                        Collectors.counting()));

        return monthlyData.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new MonthlyShipmentTrendDTO(
                        entry.getKey().getDisplayName(
                                TextStyle.SHORT,
                                Locale.ENGLISH),
                        entry.getValue()))
                .toList();
    }

    public long getDelayedShipments() {
        return shipmentRepository.countDelayed();
    }

    public long getDelayPercentage() {
        long total = shipmentRepository.count();
        if (total == 0) {
            return 0L;
        }
        return Math.round(getDelayedShipments() * 100.0 / total);
    }

    public long getAverageDeliveryTime() {
        List<DeliveryConfirmation> confirmations = deliveryConfirmationRepository
                .findByDeliveryStatus(DeliveryConfirmationStatus.CONFIRMED);

        long totalMinutes = 0L;
        int count = 0;

        for (DeliveryConfirmation confirmation : confirmations) {
            Shipment shipment = confirmation.getShipment();
            if (shipment != null
                    && shipment.getCreatedAt() != null
                    && confirmation.getDeliveryTime() != null) {

                totalMinutes += Math.max(0L, Duration.between(
                        shipment.getCreatedAt(),
                        confirmation.getDeliveryTime()).toMinutes());
                count++;
            }
        }

        return count == 0 ? 0L : Math.round((double) totalMinutes / count);
    }

    public long getDriverOnTimeRate() {
        List<DeliveryConfirmation> confirmations = deliveryConfirmationRepository
                .findByDeliveryStatus(DeliveryConfirmationStatus.CONFIRMED);

        long onTime = 0L;

        for (DeliveryConfirmation confirmation : confirmations) {
            Shipment shipment = confirmation.getShipment();
            if (shipment != null
                    && shipment.getEstimatedDeliveryAt() != null
                    && confirmation.getDeliveryTime() != null
                    && !confirmation.getDeliveryTime().isAfter(shipment.getEstimatedDeliveryAt())) {

                onTime++;
            }
        }

        int count = confirmations.size();
        return count == 0 ? 0L : Math.round(onTime * 100.0 / count);
    }

    public long getBusinessShipments() {
        return shipmentRepository.countBusinessCreated();
    }

    public List<DailyShipmentCountDTO> getShipmentsPerDay(int days) {
        int window = Math.max(1, Math.min(days, 90));
        LocalDate start = LocalDate.now().minusDays(window - 1L);

        Map<LocalDate, Long> byDay = shipmentRepository.findAll()
                .stream()
                .filter(shipment -> shipment.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        shipment -> shipment.getCreatedAt().toLocalDate(),
                        Collectors.counting()));

        List<DailyShipmentCountDTO> result = new ArrayList<>();
        for (int i = 0; i < window; i++) {
            LocalDate date = start.plusDays(i);
            result.add(new DailyShipmentCountDTO(
                    date,
                    byDay.getOrDefault(date, 0L)));
        }
        return result;
    }

    public List<MonthlyShipmentTrendDTO> getDeliveriesPerMonth() {
        Map<Month, Long> monthlyData = deliveryConfirmationRepository
                .findByDeliveryStatus(DeliveryConfirmationStatus.CONFIRMED)
                .stream()
                .filter(confirmation -> confirmation.getDeliveryTime() != null)
                .collect(Collectors.groupingBy(
                        confirmation -> confirmation.getDeliveryTime().getMonth(),
                        Collectors.counting()));

        return monthlyData.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new MonthlyShipmentTrendDTO(
                        entry.getKey().getDisplayName(
                                TextStyle.SHORT,
                                Locale.ENGLISH),
                        entry.getValue()))
                .toList();
    }

    public List<DriverPerformanceResponse> getTopDrivers(int limit) {
        int max = Math.max(1, Math.min(limit, 20));

        Map<User, List<DeliveryConfirmation>> byDriver = deliveryConfirmationRepository
                .findByDeliveryStatus(DeliveryConfirmationStatus.CONFIRMED)
                .stream()
                .filter(confirmation -> confirmation.getDriver() != null)
                .collect(Collectors.groupingBy(DeliveryConfirmation::getDriver));

        return byDriver.entrySet()
                .stream()
                .map(entry -> {
                    User driver = entry.getKey();
                    List<DeliveryConfirmation> confirmations = entry.getValue();

                    long onTime = 0L;
                    long totalMinutes = 0L;

                    for (DeliveryConfirmation confirmation : confirmations) {
                        Shipment shipment = confirmation.getShipment();
                        if (shipment != null) {
                            if (shipment.getEstimatedDeliveryAt() != null
                                    && confirmation.getDeliveryTime() != null
                                    && !confirmation.getDeliveryTime().isAfter(
                                    shipment.getEstimatedDeliveryAt())) {

                                onTime++;
                            }
                            if (shipment.getCreatedAt() != null
                                    && confirmation.getDeliveryTime() != null) {

                                totalMinutes += Math.max(0L, Duration.between(
                                        shipment.getCreatedAt(),
                                        confirmation.getDeliveryTime()).toMinutes());
                            }
                        }
                    }

                    int count = confirmations.size();
                    double onTimeRate = count == 0 ? 0.0
                            : Math.round(onTime * 100.0 / count);
                    long avgMinutes = count == 0 ? 0L
                            : Math.round((double) totalMinutes / count);

                    double totalDistanceKm = confirmations.stream()
                            .filter(confirmation -> confirmation.getShipment() != null
                                    && confirmation.getShipment().getDistanceKm() != null)
                            .mapToDouble(confirmation -> confirmation.getShipment().getDistanceKm())
                            .sum();

                    return DriverPerformanceResponse.builder()
                            .driverId(driver.getId())
                            .driverName(driver.getFullName())
                            .totalShipments(shipmentRepository.countByDriver(driver))
                            .completedDeliveries((long) count)
                            .failedDeliveries(shipmentRepository.countByDriverAndShipmentStatus(
                                    driver, ShipmentStatus.DELIVERY_FAILED))
                            .onTimeRate(onTimeRate)
                            .avgDeliveryMinutes(avgMinutes)
                            .totalDistanceKm(Math.round(totalDistanceKm * 100.0) / 100.0)
                            .build();
                })
                .sorted(Comparator.comparingLong(
                        DriverPerformanceResponse::getCompletedDeliveries).reversed())
                .limit(max)
                .toList();
    }

    public List<TopCustomerDTO> getTopCustomers(int limit) {
        int max = Math.max(1, Math.min(limit, 20));

        Map<User, List<Shipment>> byCustomer = shipmentRepository.findAll()
                .stream()
                .filter(shipment -> shipment.getCreatedBy() != null)
                .collect(Collectors.groupingBy(Shipment::getCreatedBy));

        return byCustomer.entrySet()
                .stream()
                .map(entry -> {
                    User customer = entry.getKey();
                    List<Shipment> shipments = entry.getValue();

                    long delivered = shipments.stream()
                            .filter(shipment -> shipment.getShipmentStatus() == ShipmentStatus.DELIVERED)
                            .count();
                    long cancelled = shipments.stream()
                            .filter(shipment -> shipment.getShipmentStatus() == ShipmentStatus.CANCELLED)
                            .count();

                    return new TopCustomerDTO(
                            customer.getFullName(),
                            shipments.size(),
                            delivered,
                            cancelled);
                })
                .sorted(Comparator.comparingLong(TopCustomerDTO::getTotalShipments).reversed())
                .limit(max)
                .toList();
    }
}
