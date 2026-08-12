package com.shiptrack.impl;

import com.shiptrack.dto.DeliveryConfirmationRequest;
import com.shiptrack.dto.DeliveryConfirmationResponse;
import com.shiptrack.entity.DeliveryConfirmation;
import com.shiptrack.entity.DeliveryConfirmationStatus;
import com.shiptrack.entity.NotificationType;
import com.shiptrack.entity.ProofOfDelivery;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.ShipmentStatus;
import com.shiptrack.entity.TrackingHistory;
import com.shiptrack.entity.User;
import com.shiptrack.repository.DeliveryConfirmationRepository;
import com.shiptrack.repository.ProofOfDeliveryRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.TrackingHistoryRepository;
import com.shiptrack.repository.UserRepository;
import com.shiptrack.service.DeliveryConfirmationService;
import com.shiptrack.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DeliveryConfirmationServiceImpl implements DeliveryConfirmationService {

    private final DeliveryConfirmationRepository deliveryConfirmationRepository;
    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final TrackingHistoryRepository trackingHistoryRepository;
    private final NotificationService notificationService;
    private final ProofOfDeliveryRepository proofOfDeliveryRepository;

    public DeliveryConfirmationServiceImpl(
            DeliveryConfirmationRepository deliveryConfirmationRepository,
            ShipmentRepository shipmentRepository,
            UserRepository userRepository,
            TrackingHistoryRepository trackingHistoryRepository,
            NotificationService notificationService,
            ProofOfDeliveryRepository proofOfDeliveryRepository) {

        this.deliveryConfirmationRepository = deliveryConfirmationRepository;
        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
        this.trackingHistoryRepository = trackingHistoryRepository;
        this.notificationService = notificationService;
        this.proofOfDeliveryRepository = proofOfDeliveryRepository;
    }

    @Override
    @Transactional
    public DeliveryConfirmationResponse confirmDelivery(DeliveryConfirmationRequest request) {

        if (request.getShipmentId() == null) {
            throw new RuntimeException("Shipment id is required.");
        }
        if (request.getReceiverName() == null || request.getReceiverName().isBlank()) {
            throw new RuntimeException("Receiver name is required.");
        }

        Shipment shipment = shipmentRepository.findById(request.getShipmentId())
                .orElseThrow(() -> new RuntimeException("Shipment not found."));

        if (shipment.getShipmentStatus() == ShipmentStatus.DELIVERED) {
            throw new RuntimeException("Shipment has already been delivered.");
        }

        if (deliveryConfirmationRepository.existsByShipmentIdAndDeliveryStatus(
                shipment.getId(), DeliveryConfirmationStatus.CONFIRMED)) {
            throw new RuntimeException("Delivery confirmation already exists for this shipment.");
        }

        User driver = getCurrentUser();

        if (shipment.getDriver() != null
                && !shipment.getDriver().getId().equals(driver.getId())) {
            throw new RuntimeException("You are not assigned to this shipment.");
        }

        DeliveryConfirmation confirmation = new DeliveryConfirmation();
        confirmation.setShipment(shipment);
        confirmation.setDriver(driver);
        confirmation.setCustomer(shipment.getCreatedBy());
        confirmation.setDeliveryTime(LocalDateTime.now());
        confirmation.setReceiverName(request.getReceiverName().trim());
        confirmation.setDeliveryStatus(request.getDeliveryStatus() == null
                ? DeliveryConfirmationStatus.CONFIRMED
                : request.getDeliveryStatus());
        confirmation.setRemarks(request.getRemarks());
        confirmation.setSignatureData(request.getSignatureData());
        confirmation.setDeliveryPhoto(request.getDeliveryPhoto());
        confirmation.setDeliveryLatitude(request.getLatitude());
        confirmation.setDeliveryLongitude(request.getLongitude());

        DeliveryConfirmation saved = deliveryConfirmationRepository.save(confirmation);

        if (saved.getDeliveryStatus() == DeliveryConfirmationStatus.CONFIRMED) {
            shipment.setShipmentStatus(ShipmentStatus.DELIVERED);
            shipment.setReachedDestination(true);
            shipmentRepository.save(shipment);

            TrackingHistory trackingHistory = new TrackingHistory();
            trackingHistory.setStatus(ShipmentStatus.DELIVERED);
            trackingHistory.setLocation(shipment.getDestinationAddress() != null
                    ? shipment.getDestinationAddress()
                    : shipment.getReceiverAddress());
            trackingHistory.setRemarks("Delivered to " + saved.getReceiverName()
                    + " (confirmed by driver " + driver.getFullName() + ")");
            trackingHistory.setShipment(shipment);
            trackingHistoryRepository.save(trackingHistory);

            User customer = shipment.getCreatedBy();
            if (customer != null) {
                notificationService.createNotification(
                        "Shipment Delivered Successfully",
                        "Your shipment " + shipment.getTrackingNumber()
                                + " has been delivered successfully to "
                                + saved.getReceiverName()
                                + ". Proof of Delivery is now available.",
                        NotificationType.SUCCESS,
                        customer);
            }

            notificationService.notifyUsersByRole(
                    "Shipment Delivered",
                    "Shipment #" + shipment.getTrackingNumber()
                            + " has been delivered.",
                    NotificationType.SUCCESS,
                    "ROLE_ADMIN");

            notificationService.notifyUsersByRole(
                    "Shipment Delivered",
                    "Shipment #" + shipment.getTrackingNumber()
                            + " has been delivered.",
                    NotificationType.SUCCESS,
                    "ROLE_SUPPORT");

            createProofOfDelivery(saved);
        }

        return toResponse(saved);
    }

    private void createProofOfDelivery(DeliveryConfirmation saved) {
        Shipment shipment = saved.getShipment();

        ProofOfDelivery pod = proofOfDeliveryRepository
                .findByShipmentId(shipment.getId())
                .orElse(new ProofOfDelivery());

        pod.setShipment(shipment);
        pod.setReceiverName(saved.getReceiverName());
        pod.setDeliveryTime(saved.getDeliveryTime());
        pod.setDriverName(saved.getDriver().getFullName());
        pod.setLatitude(saved.getDeliveryLatitude());
        pod.setLongitude(saved.getDeliveryLongitude());
        pod.setSignatureData(saved.getSignatureData());
        pod.setDeliveryPhoto(saved.getDeliveryPhoto());
        pod.setRemarks(saved.getRemarks());

        proofOfDeliveryRepository.save(pod);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryConfirmationResponse getConfirmationById(Long id) {
        DeliveryConfirmation confirmation = deliveryConfirmationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery confirmation not found."));
        return toResponse(confirmation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryConfirmationResponse> getAllConfirmations() {
        return deliveryConfirmationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryConfirmationResponse> getConfirmationsByShipment(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found."));
        return deliveryConfirmationRepository.findByShipment(shipment)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryConfirmationResponse> getMyDriverConfirmations() {
        User driver = getCurrentUser();
        return deliveryConfirmationRepository.findByDriver(driver)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryConfirmationResponse> getMyCustomerConfirmations() {
        User customer = getCurrentUser();
        return deliveryConfirmationRepository.findByCustomer(customer)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("User is not authenticated.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found."));
    }

    private DeliveryConfirmationResponse toResponse(DeliveryConfirmation confirmation) {
        DeliveryConfirmationResponse response = new DeliveryConfirmationResponse();
        response.setId(confirmation.getId());
        response.setShipmentId(confirmation.getShipment().getId());
        response.setTrackingNumber(confirmation.getShipment().getTrackingNumber());
        response.setShipmentStatus(confirmation.getShipment().getShipmentStatus().name());
        response.setDriverId(confirmation.getDriver().getId());
        response.setDriverName(confirmation.getDriver().getFullName());
        if (confirmation.getCustomer() != null) {
            response.setCustomerId(confirmation.getCustomer().getId());
            response.setCustomerName(confirmation.getCustomer().getFullName());
        } else {
            response.setCustomerName(confirmation.getShipment().getSenderName());
        }
        response.setDeliveryTime(confirmation.getDeliveryTime());
        response.setReceiverName(confirmation.getReceiverName());
        response.setDeliveryStatus(confirmation.getDeliveryStatus().name());
        response.setRemarks(confirmation.getRemarks());
        response.setSignatureData(confirmation.getSignatureData());
        response.setDeliveryPhoto(confirmation.getDeliveryPhoto());
        response.setDeliveryLatitude(confirmation.getDeliveryLatitude());
        response.setDeliveryLongitude(confirmation.getDeliveryLongitude());
        response.setCreatedAt(confirmation.getCreatedAt());
        return response;
    }
}
