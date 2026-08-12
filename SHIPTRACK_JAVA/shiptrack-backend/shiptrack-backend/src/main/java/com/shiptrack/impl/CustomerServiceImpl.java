package com.shiptrack.impl;

import com.shiptrack.dto.customer.CustomerDashboardResponse;
import com.shiptrack.dto.customer.CustomerNotificationResponse;
import com.shiptrack.dto.customer.CustomerProfileResponse;
import com.shiptrack.dto.customer.CustomerProfileUpdateRequest;
import com.shiptrack.dto.customer.CustomerShipmentResponse;
import com.shiptrack.dto.customer.CustomerSupportRequest;
import com.shiptrack.dto.customer.CustomerSupportResponse;
import com.shiptrack.entity.DeliveryConfirmation;
import com.shiptrack.entity.DeliveryConfirmationStatus;
import com.shiptrack.entity.SupportRequest;
import com.shiptrack.entity.SupportRequestStatus;
import com.shiptrack.entity.TicketCategory;
import com.shiptrack.entity.TicketPriority;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.ShipmentStatus;
import com.shiptrack.entity.NotificationType;
import com.shiptrack.entity.User;
import com.shiptrack.repository.NotificationRepository;
import com.shiptrack.repository.DeliveryConfirmationRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.SupportRequestRepository;
import com.shiptrack.repository.UserRepository;
import com.shiptrack.service.CustomerService;
import com.shiptrack.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final ShipmentRepository shipmentRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final SupportRequestRepository supportRequestRepository;
    private final NotificationService notificationService;
    private final DeliveryConfirmationRepository deliveryConfirmationRepository;

    public CustomerServiceImpl(
            ShipmentRepository shipmentRepository,
            UserRepository userRepository,
            NotificationRepository notificationRepository,
            SupportRequestRepository supportRequestRepository,
            NotificationService notificationService,
            DeliveryConfirmationRepository deliveryConfirmationRepository) {

        this.shipmentRepository = shipmentRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.supportRequestRepository = supportRequestRepository;
        this.notificationService = notificationService;
        this.deliveryConfirmationRepository = deliveryConfirmationRepository;
    }

    @Override
    public CustomerDashboardResponse getDashboard() {
        User customer = getCurrentUser();

        long delivered = shipmentRepository.countByCreatedByAndShipmentStatus(customer, ShipmentStatus.DELIVERED);
        long failed = shipmentRepository.countByCreatedByAndShipmentStatus(customer, ShipmentStatus.DELIVERY_FAILED);
        long successRate = delivered == 0 ? 0L
                : Math.round(delivered * 100.0 / (delivered + failed));

        List<DeliveryConfirmation> confirmations = deliveryConfirmationRepository
                .findByDeliveryStatus(DeliveryConfirmationStatus.CONFIRMED).stream()
                .filter(confirmation -> confirmation.getShipment() != null
                        && confirmation.getShipment().getCreatedBy() != null
                        && confirmation.getShipment().getCreatedBy().getId().equals(customer.getId()))
                .toList();

        long totalMinutes = 0L;
        LocalDateTime lastDeliveryDate = null;

        for (DeliveryConfirmation confirmation : confirmations) {
            if (confirmation.getDeliveryTime() != null) {
                if (confirmation.getShipment().getCreatedAt() != null) {
                    totalMinutes += Math.max(0L, Duration.between(
                            confirmation.getShipment().getCreatedAt(),
                            confirmation.getDeliveryTime()).toMinutes());
                }
                if (lastDeliveryDate == null
                        || confirmation.getDeliveryTime().isAfter(lastDeliveryDate)) {
                    lastDeliveryDate = confirmation.getDeliveryTime();
                }
            }
        }

        long averageMinutes = confirmations.isEmpty()
                ? 0L
                : Math.round((double) totalMinutes / confirmations.size());

        return CustomerDashboardResponse.builder()
                .customerId(customer.getId())
                .customerName(customer.getFullName())
                .totalShipments(shipmentRepository.countByCreatedBy(customer))
                .createdShipments(shipmentRepository.countByCreatedByAndShipmentStatus(customer, ShipmentStatus.CREATED))
                .deliveredShipments(delivered)
                .inTransitShipments(shipmentRepository.countByCreatedByAndShipmentStatus(customer, ShipmentStatus.IN_TRANSIT))
                .pendingShipments(shipmentRepository.countByCreatedByAndShipmentStatus(customer, ShipmentStatus.PENDING))
                .outForDeliveryShipments(shipmentRepository.countByCreatedByAndShipmentStatus(customer, ShipmentStatus.OUT_FOR_DELIVERY))
                .pickedUpShipments(shipmentRepository.countByCreatedByAndShipmentStatus(customer, ShipmentStatus.PICKED_UP))
                .cancelledShipments(shipmentRepository.countByCreatedByAndShipmentStatus(customer, ShipmentStatus.CANCELLED))
                .deliveryFailedShipments(failed)
                .activeShipments(shipmentRepository.countByCreatedByAndShipmentStatusIn(customer,
                        java.util.List.of(
                                ShipmentStatus.PICKED_UP,
                                ShipmentStatus.IN_TRANSIT,
                                ShipmentStatus.OUT_FOR_DELIVERY)))
                .deliverySuccessRate(successRate)
                .averageDeliveryTimeMinutes(averageMinutes)
                .lastDeliveryDate(lastDeliveryDate)
                .recentShipments(
                        shipmentRepository.findTop5ByCreatedByOrderByCreatedAtDesc(customer).stream()
                                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                                .map(this::toShipmentResponse)
                                .toList())
                .recentNotifications(List.of())
                .build();
    }

    @Override
    public List<CustomerShipmentResponse> getMyShipments() {
        User customer = getCurrentUser();
        return shipmentRepository.findByCreatedBy(customer).stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toShipmentResponse)
                .toList();
    }

    @Override
    public CustomerShipmentResponse getShipmentDetails(Long shipmentId) {
        User customer = getCurrentUser();
        Shipment shipment = shipmentRepository.findByIdAndCreatedBy(shipmentId, customer)
                .orElseThrow(() -> new RuntimeException("Shipment not found"));
        return toShipmentResponse(shipment);
    }

    @Override
    public CustomerProfileResponse getProfile() {
        User customer = getCurrentUser();
        return new CustomerProfileResponse();
    }

    @Override
    public CustomerProfileResponse updateProfile(CustomerProfileUpdateRequest request) {
        return new CustomerProfileResponse();
    }

    @Override
    public List<CustomerNotificationResponse> getNotifications() {
        return List.of();
    }

    @Override
    public CustomerSupportResponse createSupportRequest(CustomerSupportRequest request) {
        User customer = getCurrentUser();
        SupportRequest supportRequest = new SupportRequest();
        supportRequest.setSubject(request.getSubject());
        supportRequest.setMessage(request.getMessage());
        supportRequest.setTrackingNumber(request.getTrackingNumber());
        supportRequest.setUser(customer);
        supportRequest.setStatus(SupportRequestStatus.OPEN);
        supportRequest.setPriority(TicketPriority.MEDIUM);
        supportRequest.setCategory(TicketCategory.SUPPORT);
        SupportRequest saved = supportRequestRepository.save(supportRequest);

        notificationService.notifyUsersByRole(
                "New Support Ticket",
                "Customer " + customer.getFullName()
                        + " submitted a new support ticket: "
                        + saved.getSubject(),
                NotificationType.INFO,
                "ROLE_SUPPORT");

        return CustomerSupportResponse.builder()
                .supportRequestId(saved.getId())
                .subject(saved.getSubject())
                .message(saved.getMessage())
                .trackingNumber(saved.getTrackingNumber())
                .status(saved.getStatus().name())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    private CustomerShipmentResponse toShipmentResponse(Shipment shipment) {
        DeliveryConfirmation confirmation = deliveryConfirmationRepository
                .findByShipmentAndDeliveryStatus(shipment, DeliveryConfirmationStatus.CONFIRMED)
                .orElse(null);

        return CustomerShipmentResponse.builder()
                .shipmentId(shipment.getId())
                .trackingNumber(shipment.getTrackingNumber())
                .senderName(shipment.getSenderName())
                .receiverName(shipment.getReceiverName())
                .receiverAddress(shipment.getReceiverAddress())
                .packageWeight(shipment.getPackageWeight())
                .shipmentStatus(shipment.getShipmentStatus())
                .createdAt(shipment.getCreatedAt())
                .deliveryTime(confirmation == null ? null : confirmation.getDeliveryTime())
                .deliveryReceiverName(confirmation == null ? null : confirmation.getReceiverName())
                .deliveryRemarks(confirmation == null ? null : confirmation.getRemarks())
                .deliveryDriverName(confirmation == null || confirmation.getDriver() == null
                        ? null
                        : confirmation.getDriver().getFullName())
                .deliverySignature(confirmation == null ? null : confirmation.getSignatureData())
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("User not authenticated");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
