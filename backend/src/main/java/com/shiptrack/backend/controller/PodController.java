package com.shiptrack.backend.controller;

import com.shiptrack.backend.entity.PodRecord;
import com.shiptrack.backend.service.PodService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/pod")
@CrossOrigin(origins = "http://localhost:5173")
public class PodController {

    private final PodService podService;

    public PodController(PodService podService) {
        this.podService = podService;
    }

    /**
     * GET /api/pod/{shipmentId}
     * Retrieve POD record for a shipment
     */
    @GetMapping("/{shipmentId}")
    public ResponseEntity<?> getPod(@PathVariable Long shipmentId) {
        Optional<PodRecord> podOpt = podService.getPodByShipmentId(shipmentId);
        if (podOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "shipmentId", shipmentId,
                    "status", "NO_RECORD",
                    "message", "No proof of delivery captured yet."
            ));
        }
        return ResponseEntity.ok(podOpt.get());
    }

    /**
     * POST /api/pod/{shipmentId}/signature
     * Capture digital signature (base64 or SVG path)
     */
    @PostMapping("/{shipmentId}/signature")
    @PreAuthorize("hasAnyRole('LOGISTICS_OPERATOR', 'ADMINISTRATOR', 'ADMIN')")
    public ResponseEntity<PodRecord> captureSignature(
            @PathVariable Long shipmentId,
            @RequestBody Map<String, String> payload) {
        String signatureData = payload.get("signatureData");
        PodRecord updated = podService.saveSignature(shipmentId, signatureData);
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/pod/{shipmentId}/photo
     * Upload delivery photo(s)
     */
    @PostMapping("/{shipmentId}/photo")
    @PreAuthorize("hasAnyRole('LOGISTICS_OPERATOR', 'ADMINISTRATOR', 'ADMIN')")
    public ResponseEntity<PodRecord> uploadPhoto(
            @PathVariable Long shipmentId,
            @RequestBody Map<String, String> payload) {
        String photoUrl = payload.get("photoUrl");
        PodRecord updated = podService.savePhoto(shipmentId, photoUrl);
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/pod/{shipmentId}/confirm
     * Confirm delivery, record geotag & recipient name, trigger shipment DELIVERED status & notification
     */
    @PostMapping("/{shipmentId}/confirm")
    @PreAuthorize("hasAnyRole('LOGISTICS_OPERATOR', 'ADMINISTRATOR', 'ADMIN')")
    public ResponseEntity<PodRecord> confirmDelivery(
            @PathVariable Long shipmentId,
            @RequestBody Map<String, Object> payload) {
        PodRecord confirmed = podService.confirmDelivery(shipmentId, payload);
        return ResponseEntity.ok(confirmed);
    }

    /**
     * PUT /api/pod/{shipmentId}/verify
     * Verification & dispute resolution workflow (Support Agent & Admin)
     */
    @PutMapping("/{shipmentId}/verify")
    @PreAuthorize("hasAnyRole('SUPPORT_AGENT', 'ADMINISTRATOR', 'ADMIN')")
    public ResponseEntity<PodRecord> verifyPod(
            @PathVariable Long shipmentId,
            @RequestBody Map<String, String> payload) {
        String status = payload.getOrDefault("status", "VERIFIED");
        String verifiedBy = payload.getOrDefault("verifiedBy", "SupportAgent");
        String notes = payload.get("notes");
        PodRecord verified = podService.verifyPod(shipmentId, status, verifiedBy, notes);
        return ResponseEntity.ok(verified);
    }

    /**
     * GET /api/pod/disputed
     * Queue of disputed POD records for Support Agent & Admin
     */
    @GetMapping("/disputed")
    @PreAuthorize("hasAnyRole('SUPPORT_AGENT', 'ADMINISTRATOR', 'ADMIN')")
    public ResponseEntity<List<PodRecord>> getDisputedPods() {
        return ResponseEntity.ok(podService.getDisputedPods());
    }
}
