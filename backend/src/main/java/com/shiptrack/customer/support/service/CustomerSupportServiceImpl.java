package com.shiptrack.customer.support.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.repository.ShipmentRepository;
import com.shiptrack.auth.entity.Role;
import com.shiptrack.auth.entity.User;
import com.shiptrack.auth.repository.UserRepository;
import com.shiptrack.customer.support.dto.CustomerSupportResponseDto;
import com.shiptrack.customer.support.dto.RaiseIssueDto;
import com.shiptrack.customer.support.dto.ShipmentRequestDto;
import com.shiptrack.customer.support.entity.CustomerSupportRequest;
import com.shiptrack.customer.support.entity.RequestType;
import com.shiptrack.customer.support.repository.CustomerSupportRepository;
import com.shiptrack.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;

import com.shiptrack.customer.support.entity.RequestStatus;
import com.shiptrack.customer.support.entity.RequestType;

import com.shiptrack.admin.shipment.entity.Shipment;

import com.shiptrack.customer.support.entity.IssueType;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerSupportServiceImpl implements CustomerSupportService {

    private final CustomerSupportRepository customerSupportRepository;

    private final UserRepository userRepository;

    private final ShipmentRepository shipmentRepository;

    private final NotificationService notificationService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    /**
     * Returns the currently logged-in customer.
     */
    private User getLoggedInUser() {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    private String saveAttachment(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return null;
        }

        try {

            File folder = new File(uploadDir);

            if (!folder.exists()) {
                folder.mkdirs();
            }

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

            Path destination = Paths.get(uploadDir, fileName);

            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING);

            return fileName;

        } catch (IOException e) {

            throw new RuntimeException("Unable to upload attachment.");
        }
    }

    private void notifyAdmins(
            String title,
            String message,
            String trackingId) {

        userRepository.findAll()

                .stream()

                .filter(user -> user.getRole() == Role.ADMIN)

                .forEach(admin ->

                notificationService.notify(

                        admin,

                        com.shiptrack.notification.entity.NotificationType.SYSTEM,

                        title,

                        message,

                        trackingId));
    }

    private void notifySupportAgents(
            String title,
            String message,
            String trackingId) {

        userRepository.findAll()

                .stream()

                .filter(user -> user.getRole() == Role.SUPPORT_AGENT)

                .forEach(agent ->

                notificationService.notify(

                        agent,

                        com.shiptrack.notification.entity.NotificationType.SYSTEM,

                        title,

                        message,

                        trackingId));
    }

    @Override
    public void createShipmentRequest(ShipmentRequestDto request) {

        // Get logged-in customer
        User customer = getLoggedInUser();

        // Create new support request
        CustomerSupportRequest supportRequest = CustomerSupportRequest.builder()

                .customer(customer)

                .requestType(RequestType.SHIPMENT_REQUEST)

                .status(RequestStatus.PENDING)

                .senderName(request.getSenderName())

                .receiverName(request.getReceiverName())

                .pickupAddress(request.getPickupAddress())

                .deliveryAddress(request.getDeliveryAddress())

                .packageType(request.getPackageType())

                .weight(request.getWeight())

                .pickupDate(request.getPickupDate())

                .specialInstructions(request.getInstructions())

                .subject("Shipment Request")

                .description("Customer submitted a new shipment request.")

                .build();

        // Save into database
        customerSupportRepository.save(supportRequest);

        // Notification Title
        String title = "New Shipment Request";

        // Notification Message
        String message = "Customer " + customer.getName()
                + " submitted a shipment request.";

        // Notify all Admins
        notifyAdmins(title, message, null);

        // Notify all Support Agents
        notifySupportAgents(title, message, null);
    }

    @Override
    public void raiseIssue(
            RaiseIssueDto request,
            MultipartFile attachment) {

        // Logged-in customer
        User customer = getLoggedInUser();

        // Find shipment by tracking ID
        Shipment shipment = shipmentRepository
                .findByTrackingId(request.getTrackingId())
                .orElseThrow(() -> new RuntimeException("Shipment not found."));

        // (Optional) Ensure the shipment belongs to this customer
        if (!shipment.getCustomerId().getId().equals(customer.getId())) {
            throw new RuntimeException("You are not allowed to raise an issue for this shipment.");
        }

        // Upload attachment (if provided)
        String attachmentPath = saveAttachment(attachment);

        // Create support request
        CustomerSupportRequest supportRequest = CustomerSupportRequest.builder()

                .customer(customer)

                .shipment(shipment)

                .requestType(RequestType.ISSUE)

                .status(RequestStatus.OPEN)

                .issueType(request.getIssueType())

                .subject(request.getSubject())

                .description(request.getDescription())

                .attachment(attachmentPath)

                .build();

        // Save into database
        customerSupportRepository.save(supportRequest);

        // Notification title
        String title = "New Customer Issue";

        // Customer name
        String customerName = customer.getName() != null
                ? customer.getName()
                : customer.getUsername();

        // Notification message
        String message = customerName +
                " raised an issue for shipment " +
                shipment.getTrackingId();

        // Notify Admins
        notifyAdmins(
                title,
                message,
                shipment.getTrackingId());

        // Notify Support Agents
        notifySupportAgents(
                title,
                message,
                shipment.getTrackingId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerSupportResponseDto> getMyRequests() {

        User customer = getLoggedInUser();

        List<CustomerSupportRequest> requests = customerSupportRepository.findByCustomerOrderByCreatedAtDesc(customer);

        return requests.stream()
                .map(this::mapToResponse)
                .toList();
    }

    private CustomerSupportResponseDto mapToResponse(
            CustomerSupportRequest request) {

        return CustomerSupportResponseDto.builder()

                .id(request.getId())

                .requestType(request.getRequestType())

                .status(request.getStatus())

                .shipmentId(
                        request.getShipment() != null
                                ? request.getShipment().getTrackingId()
                                : null)

                .issueType(request.getIssueType())

                .subject(request.getSubject())

                .description(request.getDescription())

                .senderName(request.getSenderName())

                .receiverName(request.getReceiverName())

                .pickupAddress(request.getPickupAddress())

                .deliveryAddress(request.getDeliveryAddress())

                .packageType(request.getPackageType())

                .weight(request.getWeight())

                .pickupDate(request.getPickupDate())

                .specialInstructions(request.getSpecialInstructions())

                .attachment(request.getAttachment())

                .createdAt(request.getCreatedAt())

                .updatedAt(request.getUpdatedAt())

                .build();
    }

}