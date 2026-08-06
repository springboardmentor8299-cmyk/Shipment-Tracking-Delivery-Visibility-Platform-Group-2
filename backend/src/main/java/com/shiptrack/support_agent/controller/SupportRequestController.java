package com.shiptrack.support_agent.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shiptrack.support_agent.dto.SupportRequestResponseDto;
import com.shiptrack.support_agent.service.SupportRequestService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/support/requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SupportRequestController {

    private final SupportRequestService supportRequestService;

    /**
     * Get all customer support requests
     */
    @GetMapping
    public ResponseEntity<List<SupportRequestResponseDto>> getAllRequests() {

        return ResponseEntity.ok(
                supportRequestService.getAllRequests());
    }

    /**
     * Get request by id
     */
    @GetMapping("/{id}")
    public ResponseEntity<SupportRequestResponseDto> getRequestById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                supportRequestService.getRequestById(id));
    }

    /**
     * Assign request to logged-in support agent
     */
    @PutMapping("/{id}/assign")
    public ResponseEntity<String> assignRequest(
            @PathVariable Long id) {

        supportRequestService.assignToCurrentAgent(id);

        return ResponseEntity.ok(
                "Support Request assigned successfully.");
    }

    /**
     * Update request status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateStatus(

            @PathVariable Long id,

            @RequestParam String status) {

        supportRequestService.updateStatus(id, status);

        return ResponseEntity.ok(
                "Support Request status updated successfully.");
    }

    /**
     * Resolve request
     */
    @PutMapping("/{id}/resolve")
    public ResponseEntity<String> resolveRequest(
            @PathVariable Long id) {

        supportRequestService.resolveRequest(id);

        return ResponseEntity.ok(
                "Support Request resolved successfully.");
    }

}