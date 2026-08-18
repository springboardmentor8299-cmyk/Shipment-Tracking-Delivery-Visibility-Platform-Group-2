package com.shiptrack.backend.controller;

import com.shiptrack.backend.entity.SupportIssue;
import com.shiptrack.backend.service.SupportIssueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support/issues")
@CrossOrigin(origins = "http://localhost:5173")
public class SupportIssueController {

    private final SupportIssueService supportIssueService;

    public SupportIssueController(SupportIssueService supportIssueService) {
        this.supportIssueService = supportIssueService;
    }

    /**
     * GET /api/support/issues
     * Get all support issues for Support Agent Dashboard
     */
    @GetMapping
    public List<SupportIssue> getAllIssues() {
        return supportIssueService.getAllIssues();
    }

    /**
     * GET /api/support/issues/my
     * Get issues logged by a specific customer by email
     */
    @GetMapping("/my")
    public List<SupportIssue> getMyIssues(@RequestParam(required = false) String email) {
        return supportIssueService.getIssuesByCustomerEmail(email);
    }

    /**
     * POST /api/support/issues
     * Customer submits a new support issue or query
     */
    @PostMapping
    public SupportIssue createIssue(@RequestBody SupportIssue issue) {
        return supportIssueService.createIssue(issue);
    }

    /**
     * PUT /api/support/issues/{id}/resolve
     * Support Agent resolves customer issue with resolution notes and status
     */
    @PutMapping("/{id}/resolve")
    public ResponseEntity<SupportIssue> resolveIssue(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        String status = payload.get("status");
        String notes = payload.get("resolutionNotes");
        if (notes == null) {
            notes = payload.get("notes");
        }
        String resolvedBy = payload.getOrDefault("resolvedBy", "SupportAgent");

        SupportIssue updated = supportIssueService.resolveIssue(id, status, notes, resolvedBy);
        return ResponseEntity.ok(updated);
    }
}
