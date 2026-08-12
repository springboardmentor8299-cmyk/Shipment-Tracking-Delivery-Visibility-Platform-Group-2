package com.shiptrack.service;

import com.shiptrack.dto.SupportRequestDTO;
import com.shiptrack.dto.support.SupportAnalyticsDTO;
import com.shiptrack.dto.support.SupportOverviewDTO;
import com.shiptrack.dto.support.SupportStaffDTO;
import com.shiptrack.entity.NotificationType;
import com.shiptrack.entity.Role;
import com.shiptrack.entity.SupportRequest;
import com.shiptrack.entity.SupportRequestStatus;
import com.shiptrack.entity.TicketCategory;
import com.shiptrack.entity.TicketPriority;
import com.shiptrack.entity.User;
import com.shiptrack.repository.RoleRepository;
import com.shiptrack.repository.SupportRequestRepository;
import com.shiptrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AdminSupportService {

    private static final long OVERDUE_HOURS = 48L;

    private final SupportRequestRepository supportRequestRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final NotificationService notificationService;

    public AdminSupportService(
            SupportRequestRepository supportRequestRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            NotificationService notificationService) {

        this.supportRequestRepository = supportRequestRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.notificationService = notificationService;
    }

    public SupportOverviewDTO getOverview() {
        List<SupportRequest> all = supportRequestRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime overdueBefore = now.minusHours(OVERDUE_HOURS);

        SupportOverviewDTO dto = new SupportOverviewDTO();
        dto.setTotalTickets(all.size());
        dto.setOpenTickets(countByStatus(all, SupportRequestStatus.OPEN));
        dto.setInProgressTickets(countByStatus(all, SupportRequestStatus.IN_PROGRESS));
        dto.setResolvedTickets(countByStatus(all, SupportRequestStatus.RESOLVED));
        dto.setClosedTickets(countByStatus(all, SupportRequestStatus.CLOSED));
        dto.setEscalatedTickets(countByStatus(all, SupportRequestStatus.ESCALATED));
        dto.setComplaints(all.stream().filter(t -> t.getCategory() == TicketCategory.COMPLAINT).count());
        dto.setUnassignedTickets(all.stream()
                .filter(t -> t.getAssignedUser() == null
                        && t.getStatus() != SupportRequestStatus.RESOLVED
                        && t.getStatus() != SupportRequestStatus.CLOSED)
                .count());
        dto.setOverdueTickets(all.stream()
                .filter(t -> isOpen(t) && t.getCreatedAt().isBefore(overdueBefore))
                .count());
        dto.setHighPriorityOpen(all.stream()
                .filter(t -> isOpen(t)
                        && (t.getPriority() == TicketPriority.HIGH
                        || t.getPriority() == TicketPriority.URGENT))
                .count());
        dto.setSupportStaffCount(countSupportStaff());
        dto.setAvgResponseHours(avgHours(all, true));
        dto.setAvgResolutionHours(avgHours(all, false));
        return dto;
    }

    public List<SupportRequestDTO> getTickets(
            String status,
            String priority,
            String category) {

        List<SupportRequest> all = supportRequestRepository.findAllByOrderByCreatedAtDesc();

        if (status != null && !status.isBlank()) {
            SupportRequestStatus statusValue =
                    SupportRequestStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
            all = all.stream().filter(t -> t.getStatus() == statusValue).toList();
        }
        if (priority != null && !priority.isBlank()) {
            TicketPriority priorityValue =
                    TicketPriority.valueOf(priority.trim().toUpperCase(Locale.ROOT));
            all = all.stream().filter(t -> t.getPriority() == priorityValue).toList();
        }
        if (category != null && !category.isBlank()) {
            TicketCategory categoryValue =
                    TicketCategory.valueOf(category.trim().toUpperCase(Locale.ROOT));
            all = all.stream().filter(t -> t.getCategory() == categoryValue).toList();
        }

        return all.stream().map(this::toDto).toList();
    }

    public List<SupportRequestDTO> getComplaints() {
        return supportRequestRepository.findByCategoryOrderByCreatedAtDesc(TicketCategory.COMPLAINT)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<SupportRequestDTO> getEscalatedTickets() {
        return supportRequestRepository.findByStatusOrderByCreatedAtDesc(SupportRequestStatus.ESCALATED)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public SupportRequestDTO assignTicket(Long ticketId, Long userId) {
        SupportRequest ticket = supportRequestRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Support ticket not found"));

        if (userId == null) {
            ticket.setAssignedUser(null);
        } else {
            User agent = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            ticket.setAssignedUser(agent);

            notificationService.createNotification(
                    "Ticket Assigned",
                    "Support ticket #" + ticket.getId()
                            + " (" + ticket.getSubject() + ") has been assigned to you.",
                    NotificationType.INFO,
                    agent);
        }

        SupportRequest saved = supportRequestRepository.save(ticket);
        return toDto(saved);
    }

    @Transactional
    public SupportRequestDTO escalateTicket(Long ticketId, String reason) {
        SupportRequest ticket = supportRequestRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Support ticket not found"));

        ticket.setStatus(SupportRequestStatus.ESCALATED);
        ticket.setEscalatedAt(LocalDateTime.now());
        ticket.setEscalationReason(reason == null || reason.isBlank()
                ? "Escalated by admin" : reason.trim());

        SupportRequest saved = supportRequestRepository.save(ticket);

        notificationService.notifyUsersByRole(
                "Ticket Escalated",
                "Support ticket #" + saved.getId()
                        + " (" + saved.getSubject() + ") has been escalated: "
                        + saved.getEscalationReason(),
                NotificationType.ERROR,
                "ROLE_SUPPORT");

        return toDto(saved);
    }

    public List<SupportStaffDTO> getStaff() {
        Role supportRole = roleRepository.findByName("ROLE_SUPPORT").orElse(null);
        if (supportRole == null) {
            return List.of();
        }

        List<SupportStaffDTO> staff = new ArrayList<>();
        for (User agent : userRepository.findByRole(supportRole)) {
            staff.add(toStaffDto(agent));
        }
        return staff;
    }

    @Transactional
    public SupportStaffDTO toggleStaffActive(Long userId, boolean active) {
        User agent = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        agent.setIsActive(active);
        userRepository.save(agent);
        return toStaffDto(agent);
    }

    public SupportAnalyticsDTO getAnalytics() {
        List<SupportRequest> all = supportRequestRepository.findAll();

        SupportAnalyticsDTO dto = new SupportAnalyticsDTO();

        Map<String, Long> statusBreakdown = new LinkedHashMap<>();
        for (SupportRequestStatus status : SupportRequestStatus.values()) {
            statusBreakdown.put(status.name(), countByStatus(all, status));
        }
        dto.setStatusBreakdown(statusBreakdown);

        Map<String, Long> priorityBreakdown = new LinkedHashMap<>();
        for (TicketPriority priority : TicketPriority.values()) {
            priorityBreakdown.put(priority.name(),
                    all.stream().filter(t -> t.getPriority() == priority).count());
        }
        dto.setPriorityBreakdown(priorityBreakdown);

        Map<String, Long> categoryBreakdown = new LinkedHashMap<>();
        for (TicketCategory category : TicketCategory.values()) {
            categoryBreakdown.put(category.name(),
                    all.stream().filter(t -> t.getCategory() == category).count());
        }
        dto.setCategoryBreakdown(categoryBreakdown);

        dto.setAvgResponseHours(avgHours(all, true));
        dto.setAvgResolutionHours(avgHours(all, false));
        dto.setEscalatedCount(countByStatus(all, SupportRequestStatus.ESCALATED));
        dto.setComplaintsCount(all.stream().filter(t -> t.getCategory() == TicketCategory.COMPLAINT).count());
        dto.setStaffPerformance(getStaff());

        return dto;
    }

    public String broadcast(
            String title,
            String message,
            NotificationType type,
            String roleName) {

        notificationService.notifyUsersByRole(title, message, type, roleName);
        return "Notification sent to all " + roleName + " users.";
    }

    public SupportRequestDTO toDto(SupportRequest request) {
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
        dto.setComplaint(request.getCategory() == TicketCategory.COMPLAINT);
        return dto;
    }

    private SupportStaffDTO toStaffDto(User agent) {
        SupportStaffDTO dto = new SupportStaffDTO();
        dto.setUserId(agent.getId());
        dto.setFullName(agent.getFullName());
        dto.setEmail(agent.getEmail());
        dto.setPhone(agent.getPhone());
        dto.setActive(Boolean.TRUE.equals(agent.getIsActive()));

        List<SupportRequest> assigned =
                supportRequestRepository.findByAssignedUser(agent);

        dto.setTotalAssignedTickets(assigned.size());
        dto.setOpenAssignedTickets(assigned.stream()
                .filter(t -> t.getStatus() == SupportRequestStatus.OPEN
                        || t.getStatus() == SupportRequestStatus.IN_PROGRESS
                        || t.getStatus() == SupportRequestStatus.ESCALATED)
                .count());
        dto.setResolvedAssignedTickets(assigned.stream()
                .filter(t -> t.getStatus() == SupportRequestStatus.RESOLVED
                        || t.getStatus() == SupportRequestStatus.CLOSED)
                .count());

        List<SupportRequest> resolved = assigned.stream()
                .filter(t -> t.getResolvedAt() != null)
                .toList();
        dto.setAvgResolutionHours(avgHours(resolved));
        return dto;
    }

    private long countSupportStaff() {
        Role supportRole = roleRepository.findByName("ROLE_SUPPORT").orElse(null);
        return supportRole == null ? 0 : userRepository.findByRole(supportRole).size();
    }

    private long countByStatus(List<SupportRequest> tickets, SupportRequestStatus status) {
        return tickets.stream().filter(t -> t.getStatus() == status).count();
    }

    private boolean isOpen(SupportRequest ticket) {
        return ticket.getStatus() == SupportRequestStatus.OPEN
                || ticket.getStatus() == SupportRequestStatus.IN_PROGRESS
                || ticket.getStatus() == SupportRequestStatus.ESCALATED;
    }

    private double avgHours(List<SupportRequest> tickets, boolean response) {
        return avgHours(tickets.stream()
                .filter(t -> response
                        ? t.getRespondedAt() != null
                        : t.getResolvedAt() != null)
                .toList());
    }

    private double avgHours(List<SupportRequest> tickets) {
        if (tickets.isEmpty()) {
            return 0.0;
        }
        double total = 0.0;
        for (SupportRequest ticket : tickets) {
            LocalDateTime end = ticket.getResolvedAt() != null
                    ? ticket.getResolvedAt()
                    : ticket.getRespondedAt();
            if (end == null) {
                continue;
            }
            total += Duration.between(ticket.getCreatedAt(), end).toMinutes() / 60.0;
        }
        return Math.round((total / tickets.size()) * 10.0) / 10.0;
    }
}
