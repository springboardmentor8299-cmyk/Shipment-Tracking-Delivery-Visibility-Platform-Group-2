package com.shiptrack.controller;

import com.shiptrack.dto.SupportRequestDTO;
import com.shiptrack.dto.support.BroadcastNotificationRequest;
import com.shiptrack.dto.support.EscalateTicketRequest;
import com.shiptrack.dto.support.SupportAnalyticsDTO;
import com.shiptrack.dto.support.SupportOverviewDTO;
import com.shiptrack.dto.support.SupportStaffDTO;
import com.shiptrack.service.AdminSupportService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/support")
@PreAuthorize("hasRole('ADMIN')")
public class AdminSupportController {

    private final AdminSupportService adminSupportService;

    public AdminSupportController(AdminSupportService adminSupportService) {
        this.adminSupportService = adminSupportService;
    }

    @GetMapping("/overview")
    public SupportOverviewDTO getOverview() {
        return adminSupportService.getOverview();
    }

    @GetMapping("/tickets")
    public List<SupportRequestDTO> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category) {

        return adminSupportService.getTickets(status, priority, category);
    }

    @PutMapping("/tickets/{id}/assign")
    public SupportRequestDTO assignTicket(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {

        return adminSupportService.assignTicket(id, userId);
    }

    @PutMapping("/tickets/{id}/escalate")
    public SupportRequestDTO escalateTicket(
            @PathVariable Long id,
            @RequestBody(required = false) EscalateTicketRequest request) {

        String reason = request == null ? null : request.getReason();
        return adminSupportService.escalateTicket(id, reason);
    }

    @GetMapping("/staff")
    public List<SupportStaffDTO> getStaff() {
        return adminSupportService.getStaff();
    }

    @PutMapping("/staff/{id}/active")
    public SupportStaffDTO toggleStaffActive(
            @PathVariable Long id,
            @RequestParam boolean active) {

        return adminSupportService.toggleStaffActive(id, active);
    }

    @GetMapping("/analytics")
    public SupportAnalyticsDTO getAnalytics() {
        return adminSupportService.getAnalytics();
    }

    @GetMapping("/complaints")
    public List<SupportRequestDTO> getComplaints() {
        return adminSupportService.getComplaints();
    }

    @GetMapping("/escalated")
    public List<SupportRequestDTO> getEscalatedTickets() {
        return adminSupportService.getEscalatedTickets();
    }

    @PostMapping("/notify")
    public String broadcast(@Valid @RequestBody BroadcastNotificationRequest request) {
        return adminSupportService.broadcast(
                request.getTitle(),
                request.getMessage(),
                request.getType(),
                request.getRole());
    }
}
