package com.shiptrack.support_agent.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shiptrack.auth.entity.Role;
import com.shiptrack.auth.entity.User;
import com.shiptrack.auth.repository.UserRepository;
import com.shiptrack.customer.support.entity.CustomerSupportRequest;
import com.shiptrack.customer.support.repository.CustomerSupportRepository;
import com.shiptrack.notification.entity.NotificationType;
import com.shiptrack.notification.service.NotificationService;
import com.shiptrack.support_agent.dto.SupportAgentResponseDto;
import com.shiptrack.support_agent.dto.SupportRequestResponseDto;

import lombok.RequiredArgsConstructor;

import java.util.stream.Collectors;

import com.shiptrack.customer.support.entity.RequestStatus;

@Service
@RequiredArgsConstructor
@Transactional
public class SupportRequestServiceImpl implements SupportRequestService {

        private final CustomerSupportRepository customerSupportRepository;

        private final UserRepository userRepository;

        private final NotificationService notificationService;

        private User getLoggedInSupportAgent() {

                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

                String username = authentication.getName();

                User user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("Support Agent not found."));

                if (user.getRole() != Role.SUPPORT_AGENT) {
                        throw new RuntimeException("Access denied.");
                }

                return user;
        }

        private void notifyCustomer(
                        User customer,
                        String title,
                        String message,
                        String trackingId) {

                notificationService.notify(

                                customer,

                                NotificationType.SYSTEM,

                                title,

                                message,

                                trackingId

                );
        }

        private SupportRequestResponseDto mapToDto(
                        CustomerSupportRequest request) {

                return SupportRequestResponseDto.builder()

                                .id(request.getId())

                                .requestType(request.getRequestType())

                                .status(request.getStatus())

                                .customerName(
                                                request.getCustomer() != null
                                                                ? request.getCustomer().getName()
                                                                : null)

                                .trackingId(
                                                request.getShipment() != null
                                                                ? request.getShipment().getTrackingId()
                                                                : null)

                                .senderName(request.getSenderName())

                                .receiverName(request.getReceiverName())

                                .pickupAddress(request.getPickupAddress())

                                .deliveryAddress(request.getDeliveryAddress())

                                .packageType(request.getPackageType())

                                .weight(request.getWeight())

                                .pickupDate(request.getPickupDate())

                                .specialInstructions(
                                                request.getSpecialInstructions())

                                .issueType(request.getIssueType())

                                .subject(request.getSubject())

                                .description(request.getDescription())

                                .attachment(request.getAttachment())

                                .assignedTo(

                                                request.getAssignedTo() != null

                                                                ? request.getAssignedTo().getName()

                                                                : null

                                )

                                .createdAt(request.getCreatedAt())

                                .updatedAt(request.getUpdatedAt())

                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public List<SupportRequestResponseDto> getAllRequests() {

                List<CustomerSupportRequest> requests = customerSupportRepository.findAllByOrderByCreatedAtDesc();

                return requests.stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional(readOnly = true)
        public List<SupportRequestResponseDto> getMyRequests() {

                User supportAgent = getLoggedInSupportAgent();

                System.out.println(
                                "Logged-in Support Agent: "
                                                + supportAgent.getName()
                                                + " | ID: "
                                                + supportAgent.getId()
                                                + " | Username: "
                                                + supportAgent.getUsername());

                List<CustomerSupportRequest> requests = customerSupportRepository
                                .findByAssignedToIdOrderByCreatedAtDesc(
                                                supportAgent.getId());

                System.out.println(
                                "Requests assigned to "
                                                + supportAgent.getName()
                                                + ": "
                                                + requests.size());

                return requests.stream()
                                .map(this::mapToDto)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional(readOnly = true)
        public SupportRequestResponseDto getRequestById(Long id) {

                CustomerSupportRequest request = customerSupportRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Support Request not found."));

                return mapToDto(request);
        }

        @Override
        public void assignToCurrentAgent(Long id) {

                User supportAgent = getLoggedInSupportAgent();

                CustomerSupportRequest request = customerSupportRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Support Request not found."));

                if (request.getAssignedTo() != null) {
                        throw new RuntimeException("Request is already assigned.");
                }

                request.setAssignedTo(supportAgent);

                customerSupportRepository.save(request);

                notificationService.notify(

                                supportAgent,

                                NotificationType.SYSTEM,

                                "New Support Request Assigned",

                                "Support Request #" + request.getId()
                                                + " has been assigned to you.",

                                request.getShipment() != null
                                                ? request.getShipment().getTrackingId()
                                                : null

                );

                userRepository.findAll().stream()

                                .filter(user -> user.getRole() == Role.ADMIN)

                                .forEach(admin ->

                                notificationService.notify(

                                                admin,

                                                NotificationType.SYSTEM,

                                                "Customer Support Request Assigned",

                                                "Support Request #"
                                                                + request.getId()
                                                                + " has been assigned to "
                                                                + supportAgent.getName(),

                                                request.getShipment() != null
                                                                ? request.getShipment().getTrackingId()
                                                                : null

                                )

                                );

                notifyCustomer(

                                request.getCustomer(),

                                "Support Request Assigned",

                                "Your support request #" + request.getId()
                                                + " has been assigned to a support agent.",

                                request.getShipment() != null
                                                ? request.getShipment().getTrackingId()
                                                : null

                );
        }

        @Override
        public void updateStatus(Long id, String status) {

                CustomerSupportRequest request = customerSupportRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Support Request not found."));

                RequestStatus requestStatus;

                try {

                        requestStatus = RequestStatus.valueOf(status.toUpperCase());

                } catch (IllegalArgumentException ex) {

                        throw new RuntimeException("Invalid Request Status : " + status);

                }

                request.setStatus(requestStatus);

                customerSupportRepository.save(request);

                notifyCustomer(

                                request.getCustomer(),

                                "Support Request Status Updated",

                                "Your support request #" + request.getId()
                                                + " status has been updated to "
                                                + requestStatus,

                                request.getShipment() != null
                                                ? request.getShipment().getTrackingId()
                                                : null

                );

                if (request.getAssignedTo() != null) {

                        notificationService.notify(

                                        request.getAssignedTo(),

                                        NotificationType.SYSTEM,

                                        "Support Request Updated",

                                        "Support Request #" + request.getId()
                                                        + " status changed to "
                                                        + requestStatus,

                                        request.getShipment() != null
                                                        ? request.getShipment().getTrackingId()
                                                        : null

                        );

                }

                userRepository.findAll()

                                .stream()

                                .filter(user -> user.getRole() == Role.ADMIN)

                                .forEach(admin ->

                                notificationService.notify(

                                                admin,

                                                NotificationType.SYSTEM,

                                                "Support Request Updated",

                                                "Support Request #"
                                                                + request.getId()
                                                                + " status updated to "
                                                                + requestStatus,

                                                request.getShipment() != null
                                                                ? request.getShipment().getTrackingId()
                                                                : null

                                )

                                );

        }

        @Override
        public void resolveRequest(Long id) {

                CustomerSupportRequest request = customerSupportRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Support Request not found."));

                if (request.getStatus() == RequestStatus.RESOLVED) {
                        throw new RuntimeException("Support Request is already resolved.");
                }

                request.setStatus(RequestStatus.RESOLVED);

                customerSupportRepository.save(request);

                notifyCustomer(

                                request.getCustomer(),

                                "Support Request Resolved",

                                "Your support request #" + request.getId()
                                                + " has been resolved successfully.",

                                request.getShipment() != null
                                                ? request.getShipment().getTrackingId()
                                                : null

                );

                if (request.getAssignedTo() != null) {

                        notificationService.notify(

                                        request.getAssignedTo(),

                                        NotificationType.SYSTEM,

                                        "Support Request Resolved",

                                        "Support Request #"
                                                        + request.getId()
                                                        + " has been marked as RESOLVED.",

                                        request.getShipment() != null
                                                        ? request.getShipment().getTrackingId()
                                                        : null

                        );

                }

                userRepository.findAll()
                                .stream()
                                .filter(user -> user.getRole() == Role.ADMIN)
                                .forEach(admin ->

                                notificationService.notify(

                                                admin,

                                                NotificationType.SYSTEM,

                                                "Support Request Resolved",

                                                "Support Request #"
                                                                + request.getId()
                                                                + " has been resolved by "
                                                                + (request.getAssignedTo() != null
                                                                                ? request.getAssignedTo().getName()
                                                                                : "Support Agent"),

                                                request.getShipment() != null
                                                                ? request.getShipment().getTrackingId()
                                                                : null

                                )

                                );

        }

        @Override
        public void assignToSupportAgent(Long requestId, Long agentId) {

                CustomerSupportRequest request = customerSupportRepository
                                .findById(requestId)
                                .orElseThrow(() -> new RuntimeException("Support Request not found."));

                User supportAgent = userRepository
                                .findById(agentId)
                                .orElseThrow(() -> new RuntimeException("Support Agent not found."));

                if (supportAgent.getRole() != Role.SUPPORT_AGENT) {
                        throw new RuntimeException(
                                        "Selected user is not a Support Agent.");
                }

                request.setAssignedTo(supportAgent);

                customerSupportRepository.save(request);

                notificationService.notify(
                                supportAgent,
                                NotificationType.SYSTEM,
                                "New Support Request Assigned",
                                "Support Request #" + request.getId()
                                                + " has been assigned to you.",
                                request.getShipment() != null
                                                ? request.getShipment().getTrackingId()
                                                : null);

                userRepository.findAll()
                                .stream()
                                .filter(user -> user.getRole() == Role.ADMIN)
                                .forEach(admin -> notificationService.notify(
                                                admin,
                                                NotificationType.SYSTEM,
                                                "Customer Support Request Assigned",
                                                "Support Request #"
                                                                + request.getId()
                                                                + " has been assigned to "
                                                                + supportAgent.getName(),
                                                request.getShipment() != null
                                                                ? request.getShipment().getTrackingId()
                                                                : null));

                notifyCustomer(
                                request.getCustomer(),
                                "Support Request Assigned",
                                "Your support request #" + request.getId()
                                                + " has been assigned to a support agent.",
                                request.getShipment() != null
                                                ? request.getShipment().getTrackingId()
                                                : null);
        }

        @Override
        @Transactional(readOnly = true)
        public List<SupportAgentResponseDto> getSupportAgents() {

                return userRepository.findByRole(Role.SUPPORT_AGENT)
                                .stream()
                                .map(user -> SupportAgentResponseDto.builder()
                                                .id(user.getId())
                                                .name(user.getName())
                                                .username(user.getUsername())
                                                .build())
                                .collect(Collectors.toList());
        }

}