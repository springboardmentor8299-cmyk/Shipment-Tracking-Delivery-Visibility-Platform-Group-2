package com.shiptrack.controller;

import com.shiptrack.dto.SupportRequestDTO;
import com.shiptrack.dto.customer.CustomerSupportRequest;
import com.shiptrack.dto.customer.CustomerSupportResponse;
import com.shiptrack.entity.SupportRequest;
import com.shiptrack.entity.SupportRequestStatus;
import com.shiptrack.entity.User;
import com.shiptrack.repository.SupportRequestRepository;
import com.shiptrack.service.CustomerService;
import com.shiptrack.service.NotificationService;
import com.shiptrack.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/support-requests")
public class SupportRequestController {

    private final CustomerService customerService;
    private final SupportRequestRepository supportRequestRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    public SupportRequestController(CustomerService customerService,
                                    SupportRequestRepository supportRequestRepository,
                                    UserService userService,
                                    NotificationService notificationService) {
        this.customerService = customerService;
        this.supportRequestRepository = supportRequestRepository;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    @PostMapping
    public CustomerSupportResponse create(@RequestBody CustomerSupportRequest request) {
        return customerService.createSupportRequest(request);
    }

    @GetMapping
    public List<SupportRequestDTO> getAll(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        boolean supportView = user.getRole() != null
                && ("ROLE_SUPPORT".equals(user.getRole().getName())
                || "ROLE_ADMIN".equals(user.getRole().getName()));

        return (supportView ? supportRequestRepository.findAll()
                : supportRequestRepository.findByUserOrderByCreatedAtDesc(user))
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toDto)
                .toList();
    }

    @PutMapping("/{id}")
    public SupportRequestDTO updateSupportRequest(
            @PathVariable Long id,
            @RequestBody SupportRequestDTO requestDTO,
            Authentication authentication) {

        User user = userService.findByEmail(authentication.getName());
        boolean supportView = user.getRole() != null
                && ("ROLE_SUPPORT".equals(user.getRole().getName())
                || "ROLE_ADMIN".equals(user.getRole().getName()));

        if (!supportView) {
            throw new RuntimeException("Only support users can update tickets");
        }

        SupportRequest request = supportRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Support request not found"));

        if (requestDTO.getStatus() != null && !requestDTO.getStatus().isBlank()) {
            request.setStatus(SupportRequestStatus.valueOf(
                    requestDTO.getStatus().trim().toUpperCase(Locale.ROOT)));
        }
        if (requestDTO.getPriority() != null && !requestDTO.getPriority().isBlank()) {
            request.setPriority(com.shiptrack.entity.TicketPriority.valueOf(
                    requestDTO.getPriority().trim().toUpperCase(Locale.ROOT)));
        }
        if (requestDTO.getCategory() != null && !requestDTO.getCategory().isBlank()) {
            request.setCategory(com.shiptrack.entity.TicketCategory.valueOf(
                    requestDTO.getCategory().trim().toUpperCase(Locale.ROOT)));
        }
        if (requestDTO.getResponseMessage() != null) {
            request.setResponseMessage(requestDTO.getResponseMessage());
            if (requestDTO.getResponseMessage().isBlank()) {
                request.setResponseMessage(null);
            } else if (request.getRespondedAt() == null) {
                request.setRespondedAt(java.time.LocalDateTime.now());
            }
        }

        if (request.getStatus() == SupportRequestStatus.RESOLVED
                || request.getStatus() == SupportRequestStatus.CLOSED) {
            if (request.getResolvedAt() == null) {
                request.setResolvedAt(java.time.LocalDateTime.now());
            }
        }
        if (request.getStatus() == SupportRequestStatus.ESCALATED
                && request.getEscalatedAt() == null) {
            request.setEscalatedAt(java.time.LocalDateTime.now());
        }

        SupportRequest saved = supportRequestRepository.save(request);

        if (saved.getStatus() == SupportRequestStatus.RESOLVED
                || saved.getStatus() == SupportRequestStatus.CLOSED) {
            if (saved.getUser() != null) {
                notificationService.createNotification(
                        "Ticket Resolved",
                        "Your support ticket #" + saved.getId()
                                + " (" + saved.getSubject() + ") has been "
                                + saved.getStatus().name().toLowerCase() + ".",
                        com.shiptrack.entity.NotificationType.SUCCESS,
                        saved.getUser());
            }
        }

        return toDto(saved);
    }

    private SupportRequestDTO toDto(SupportRequest request) {
        SupportRequestDTO dto = new SupportRequestDTO();
        dto.setId(request.getId());
        dto.setSubject(request.getSubject());
        dto.setMessage(request.getMessage());
        dto.setResponseMessage(request.getResponseMessage());
        dto.setTrackingNumber(request.getTrackingNumber());
        dto.setStatus(request.getStatus().name());
        dto.setPriority(request.getPriority().name());
        dto.setCategory(request.getCategory().name());
        dto.setAssignedUserId(request.getAssignedUser() == null ? null : request.getAssignedUser().getId());
        dto.setAssignedName(request.getAssignedUser() == null ? "" : request.getAssignedUser().getFullName());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setRespondedAt(request.getRespondedAt());
        dto.setResolvedAt(request.getResolvedAt());
        dto.setEscalatedAt(request.getEscalatedAt());
        dto.setEscalationReason(request.getEscalationReason());
        dto.setCustomerName(request.getUser() == null ? "" : request.getUser().getFullName());
        dto.setCustomerEmail(request.getUser() == null ? "" : request.getUser().getEmail());
        dto.setComplaint(request.getCategory() == com.shiptrack.entity.TicketCategory.COMPLAINT);
        return dto;
    }
}
