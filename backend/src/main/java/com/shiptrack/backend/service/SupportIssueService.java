package com.shiptrack.backend.service;

import com.shiptrack.backend.entity.SupportIssue;
import com.shiptrack.backend.repository.SupportIssueRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SupportIssueService {

    private final SupportIssueRepository supportIssueRepository;

    public SupportIssueService(SupportIssueRepository supportIssueRepository) {
        this.supportIssueRepository = supportIssueRepository;
    }

    public List<SupportIssue> getAllIssues() {
        List<SupportIssue> issues = supportIssueRepository.findAllByOrderByIdDesc();
        if (issues.isEmpty()) {
            // Seed sample initial issues for demonstration
            seedInitialIssues();
            return supportIssueRepository.findAllByOrderByIdDesc();
        }
        return issues;
    }

    public List<SupportIssue> getIssuesByCustomerEmail(String customerEmail) {
        if (customerEmail == null || customerEmail.isBlank()) {
            return getAllIssues();
        }
        return supportIssueRepository.findByCustomerEmailIgnoreCaseOrderByIdDesc(customerEmail);
    }

    public SupportIssue createIssue(SupportIssue issue) {
        if (issue.getCreatedAt() == null) {
            issue.setCreatedAt(LocalDateTime.now());
        }
        if (issue.getStatus() == null || issue.getStatus().isBlank()) {
            issue.setStatus("PENDING");
        }
        return supportIssueRepository.save(issue);
    }

    public SupportIssue resolveIssue(Long id, String status, String resolutionNotes, String resolvedBy) {
        SupportIssue issue = supportIssueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Support Issue not found with ID: " + id));

        if (status != null && !status.isBlank()) {
            issue.setStatus(status.toUpperCase());
        } else {
            issue.setStatus("RESOLVED");
        }

        if (resolutionNotes != null) {
            issue.setResolutionNotes(resolutionNotes);
        }

        if (resolvedBy != null) {
            issue.setResolvedBy(resolvedBy);
        }

        issue.setResolvedAt(LocalDateTime.now());
        return supportIssueRepository.save(issue);
    }

    private void seedInitialIssues() {
        SupportIssue issue1 = new SupportIssue(
                "ISSUE",
                "TRK-79282CB1",
                "Delayed Delivery",
                "do this shipment active",
                "Customer requested clarification on tracking status and live location updates for shipment #TRK-79282CB1.",
                "customer@cargoflow.com",
                "Customer John"
        );
        issue1.setStatus("RESOLVED");
        issue1.setResolutionNotes("Support agent verified shipment is in transit and provided updated ETA.");
        issue1.setResolvedBy("SupportAgent");

        SupportIssue issue2 = new SupportIssue(
                "ISSUE",
                "SH48921",
                "Package Damaged",
                "Outer box arrived damaged",
                "Package outer box was dented upon arrival at local dispatch hub. Requesting inspection.",
                "sarah.c@gmail.com",
                "Sarah Connor"
        );
        issue2.setStatus("PENDING");

        SupportIssue issue3 = new SupportIssue(
                "SHIPMENT_REQUEST",
                "SH98124",
                "Shipment Request",
                "Special heavy cargo dispatch request",
                "Customer requested express priority transport for fragile commercial freight.",
                "mike.logistics@corp.com",
                "Mike Logistics"
        );
        issue3.setStatus("IN_PROGRESS");
        issue3.setResolutionNotes("Route assigned to field driver Sanjai.");

        supportIssueRepository.saveAll(List.of(issue1, issue2, issue3));
    }
}
