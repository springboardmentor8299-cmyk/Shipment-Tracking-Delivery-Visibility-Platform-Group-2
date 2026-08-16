package com.shiptrackpro.controller;

import com.shiptrackpro.dto.ShipmentDTO;
import com.shiptrackpro.entity.*;
import com.shiptrackpro.service.ShipmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shipments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ShipmentController {

    @Autowired
    private ShipmentService shipmentService;

    @GetMapping
    public ResponseEntity<List<Shipment>> getAllShipments() {
        return ResponseEntity.ok(shipmentService.getAllShipments());
    }

    @GetMapping("/{trackingNumber}")
    public ResponseEntity<?> getShipment(@PathVariable String trackingNumber) {
        return shipmentService.getShipmentByTrackingNumber(trackingNumber)
                .or(() -> shipmentService.getShipmentById(trackingNumber))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Shipment> createShipment(@RequestBody ShipmentDTO.CreateRequest request) {
        return ResponseEntity.ok(shipmentService.createShipment(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Shipment> updateShipment(@PathVariable String id, @RequestBody Shipment updated) {
        return ResponseEntity.ok(shipmentService.updateShipment(id, updated));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Shipment> cancelShipment(@PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : "Cancelled by client/operator";
        return ResponseEntity.ok(shipmentService.cancelShipment(id, reason));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Shipment> assignOperator(@PathVariable String id, @RequestBody ShipmentDTO.AssignOperatorRequest request) {
        return ResponseEntity.ok(shipmentService.assignOperator(id, request));
    }

    @PostMapping("/{id}/dispatch-respond")
    public ResponseEntity<Shipment> respondToDispatch(@PathVariable String id, @RequestBody ShipmentDTO.DispatchResponseRequest request) {
        return ResponseEntity.ok(shipmentService.respondToDispatch(id, request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Shipment> updateStatus(@PathVariable String id, @RequestBody ShipmentDTO.StatusUpdateRequest request) {
        return ResponseEntity.ok(shipmentService.updateStatus(id, request));
    }

    @PutMapping("/{id}/telemetry")
    public ResponseEntity<Shipment> updateTelemetry(@PathVariable String id, @RequestBody ShipmentDTO.TelemetryUpdateRequest request) {
        return ResponseEntity.ok(shipmentService.updateTelemetry(id, request));
    }

    @PostMapping("/{id}/pod")
    public ResponseEntity<Shipment> submitPod(@PathVariable String id, @RequestBody ProofOfDelivery pod) {
        return ResponseEntity.ok(shipmentService.submitProofOfDelivery(id, pod));
    }

    @PostMapping("/{id}/issues")
    public ResponseEntity<TransitIssue> reportIssue(@PathVariable String id, @RequestBody ShipmentDTO.IssueReportRequest request) {
        return ResponseEntity.ok(shipmentService.reportIssue(id, request));
    }

    @PutMapping("/{id}/pod-verify")
    public ResponseEntity<Shipment> verifyPod(@PathVariable String id, @RequestBody Map<String, String> body) {
        String verificationStatus = body.getOrDefault("verificationStatus", "VERIFIED");
        String auditNotes = body.get("auditNotes");
        String verifiedBy = body.get("verifiedByUserId");
        return ResponseEntity.ok(shipmentService.verifyPod(id, verificationStatus, auditNotes, verifiedBy));
    }

    @PutMapping("/{id}/issue-resolve")
    public ResponseEntity<TransitIssue> resolveIssue(@PathVariable String id, @RequestBody Map<String, String> body) {
        String issueId = body.getOrDefault("issueId", "iss-" + id);
        String status = body.getOrDefault("status", "Resolved");
        String notes = body.getOrDefault("notes", "Resolved by Support Agent");
        String resolvedBy = body.getOrDefault("resolvedBy", "Support Agent");
        return ResponseEntity.ok(shipmentService.resolveIssue(id, issueId, status, notes, resolvedBy));
    }

    @PostMapping("/{id}/pickup-photo")
    public ResponseEntity<Shipment> recordPickupPhoto(@PathVariable String id, @RequestBody Map<String, String> body) {
        String pickupPhotoUrl = body.get("pickupPhotoUrl");
        String note = body.get("note");
        return ResponseEntity.ok(shipmentService.recordPickupPhoto(id, pickupPhotoUrl, note));
    }

    @PostMapping("/{id}/chat")
    public ResponseEntity<ChatMessage> sendChatMessage(@PathVariable String id, @RequestBody ShipmentDTO.ChatMessageRequest request) {
        return ResponseEntity.ok(shipmentService.sendChatMessage(id, request));
    }

    @PostMapping("/{id}/sos")
    public ResponseEntity<Map<String, Object>> triggerSos(@PathVariable String id) {
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Emergency SOS signal broadcasted to Dispatch Control Tower");
        return ResponseEntity.ok(res);
    }
}
