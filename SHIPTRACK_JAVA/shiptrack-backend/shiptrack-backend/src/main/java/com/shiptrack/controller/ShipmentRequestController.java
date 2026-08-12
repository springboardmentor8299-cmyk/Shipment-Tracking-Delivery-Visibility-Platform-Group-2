package com.shiptrack.controller;

import com.shiptrack.dto.ShipmentRequestDTO;
import com.shiptrack.dto.CreateShipmentRequest;
import com.shiptrack.dto.ShipmentRequestResponseRequest;
import com.shiptrack.entity.NotificationType;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.ShipmentRequest;
import com.shiptrack.entity.ShipmentStatus;
import com.shiptrack.entity.User;
import com.shiptrack.repository.ShipmentRequestRepository;
import com.shiptrack.service.NotificationService;
import com.shiptrack.service.ShipmentService;
import com.shiptrack.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/shipment-requests")
public class ShipmentRequestController {

    private final ShipmentRequestRepository shipmentRequestRepository;
    private final UserService userService;
    private final ShipmentService shipmentService;
    private final NotificationService notificationService;

    public ShipmentRequestController(ShipmentRequestRepository shipmentRequestRepository,
                                     UserService userService,
                                     ShipmentService shipmentService,
                                     NotificationService notificationService) {
        this.shipmentRequestRepository = shipmentRequestRepository;
        this.userService = userService;
        this.shipmentService = shipmentService;
        this.notificationService = notificationService;
    }

    @PostMapping
    public ShipmentRequestDTO create(@RequestBody CreateShipmentRequest request, Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        ShipmentRequest shipmentRequest = new ShipmentRequest();
        shipmentRequest.setSenderName(request.getSenderName());
        shipmentRequest.setReceiverName(request.getReceiverName());
        shipmentRequest.setCustomerEmail(request.getCustomerEmail());
        shipmentRequest.setCustomerPhone(request.getCustomerPhone());
        shipmentRequest.setSourceAddress(request.getSourceAddress());
        shipmentRequest.setDestinationAddress(request.getDestinationAddress());
        shipmentRequest.setPackageWeight(request.getPackageWeight());
        shipmentRequest.setUser(user);
        ShipmentRequest saved = shipmentRequestRepository.save(shipmentRequest);
        return toDto(saved);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public List<ShipmentRequestDTO> getAll() {
        return shipmentRequestRepository.findAll().stream().map(this::toDto).toList();
    }

    @GetMapping("/me")
    public List<ShipmentRequestDTO> getMine(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        return shipmentRequestRepository.findByUserOrderByCreatedAtDesc(user).stream().map(this::toDto).toList();
    }

    @PutMapping("/{id}/response")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ShipmentRequestDTO respondToRequest(@PathVariable Long id,
                                               @RequestBody ShipmentRequestResponseRequest responseRequest) {
        ShipmentRequest shipmentRequest = shipmentRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment request not found"));

        LocalDateTime respondedAt = LocalDateTime.now();
        String responseMessage;

        if (responseRequest.isShipmentCreated()) {
            CreateShipmentRequest createShipmentRequest = new CreateShipmentRequest();
            createShipmentRequest.setCustomerEmail(shipmentRequest.getCustomerEmail());
            createShipmentRequest.setCustomerPhone(shipmentRequest.getCustomerPhone());
            createShipmentRequest.setSenderName(shipmentRequest.getSenderName());
            createShipmentRequest.setReceiverName(shipmentRequest.getReceiverName());
            createShipmentRequest.setSourceAddress(shipmentRequest.getSourceAddress());
            createShipmentRequest.setDestinationAddress(shipmentRequest.getDestinationAddress());
            createShipmentRequest.setPackageWeight(shipmentRequest.getPackageWeight());
            createShipmentRequest.setShipmentStatus(ShipmentStatus.CREATED);

            Shipment shipment = shipmentService.createShipment(createShipmentRequest);

            shipmentRequest.setShipmentCreated(true);
            shipmentRequest.setCreatedShipmentId(shipment.getId());
            shipmentRequest.setRequestedStatus(ShipmentStatus.CREATED);

            responseMessage = buildCreatedMessage(shipmentRequest, shipment, respondedAt);
            notificationService.createNotification(
                    "Shipment Created",
                    responseMessage,
                    NotificationType.SUCCESS,
                    shipmentRequest.getUser());
        } else {
            shipmentRequest.setShipmentCreated(false);
            shipmentRequest.setCreatedShipmentId(null);
            shipmentRequest.setRequestedStatus(ShipmentStatus.CANCELLED);

            responseMessage = buildNotCreatedMessage(shipmentRequest, responseRequest.getMessage(), respondedAt);
            notificationService.createNotification(
                    "Shipment Request Update",
                    responseMessage,
                    NotificationType.WARNING,
                    shipmentRequest.getUser());
        }

        shipmentRequest.setResponseSent(true);
        shipmentRequest.setResponseMessage(responseMessage);
        shipmentRequest.setRespondedAt(respondedAt);

        return toDto(shipmentRequestRepository.save(shipmentRequest));
    }

    private ShipmentRequestDTO toDto(ShipmentRequest request) {
        ShipmentRequestDTO dto = new ShipmentRequestDTO();
        dto.setId(request.getId());
        dto.setSenderName(request.getSenderName());
        dto.setReceiverName(request.getReceiverName());
        dto.setCustomerEmail(request.getCustomerEmail());
        dto.setCustomerPhone(request.getCustomerPhone());
        dto.setSourceAddress(request.getSourceAddress());
        dto.setDestinationAddress(request.getDestinationAddress());
        dto.setPackageWeight(request.getPackageWeight());
        dto.setRequestedStatus(request.getRequestedStatus().name());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setCustomerName(request.getUser() == null ? "" : request.getUser().getFullName());
        dto.setResponseSent(Boolean.TRUE.equals(request.isResponseSent()));
        dto.setShipmentCreated(Boolean.TRUE.equals(request.isShipmentCreated()));
        dto.setResponseMessage(request.getResponseMessage());
        dto.setCreatedShipmentId(request.getCreatedShipmentId());
        dto.setRespondedAt(request.getRespondedAt());
        return dto;
    }

    private String buildCreatedMessage(ShipmentRequest request, Shipment shipment, LocalDateTime respondedAt) {
        return "Hello " + request.getUser().getFullName() + ", your shipment request has been created successfully."
                + "\nSender: " + request.getSenderName()
                + "\nReceiver: " + request.getReceiverName()
                + "\nSource Location: " + request.getSourceAddress()
                + "\nDestination Location: " + request.getDestinationAddress()
                + "\nShipment ID: " + shipment.getId()
                + "\nTracking Number: " + shipment.getTrackingNumber()
                + "\nDate: " + respondedAt.format(DateTimeFormatter.ofPattern("dd MMM yyyy"))
                + "\nTime: " + respondedAt.format(DateTimeFormatter.ofPattern("hh:mm a"))
                + "\nThank you for using ShipTrack.";
    }

    private String buildNotCreatedMessage(ShipmentRequest request, String adminMessage, LocalDateTime respondedAt) {
        String note = adminMessage == null || adminMessage.trim().isEmpty()
                ? "Please contact support for more details."
                : adminMessage.trim();

        return "Hello " + request.getUser().getFullName() + ", your shipment request was not created."
                + "\nSender: " + request.getSenderName()
                + "\nReceiver: " + request.getReceiverName()
                + "\nSource Location: " + request.getSourceAddress()
                + "\nDestination Location: " + request.getDestinationAddress()
                + "\nDate: " + respondedAt.format(DateTimeFormatter.ofPattern("dd MMM yyyy"))
                + "\nTime: " + respondedAt.format(DateTimeFormatter.ofPattern("hh:mm a"))
                + "\nMessage: " + note;
    }
}
