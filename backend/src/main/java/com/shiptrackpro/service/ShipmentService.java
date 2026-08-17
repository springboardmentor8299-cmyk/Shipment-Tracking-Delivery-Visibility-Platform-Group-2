package com.shiptrackpro.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shiptrackpro.dto.ShipmentDTO;
import com.shiptrackpro.entity.ChatMessage;
import com.shiptrackpro.entity.DispatchStatus;
import com.shiptrackpro.entity.Driver;
import com.shiptrackpro.entity.PriorityLevel;
import com.shiptrackpro.entity.ProofOfDelivery;
import com.shiptrackpro.entity.Shipment;
import com.shiptrackpro.entity.ShipmentEvent;
import com.shiptrackpro.entity.ShipmentStatus;
import com.shiptrackpro.entity.TransitIssue;
import com.shiptrackpro.repository.ChatMessageRepository;
import com.shiptrackpro.repository.ShipmentEventRepository;
import com.shiptrackpro.repository.ShipmentRepository;
import com.shiptrackpro.repository.TransitIssueRepository;

@Service
public class ShipmentService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Autowired
    private ShipmentRepository shipmentRepository;

    @Autowired
    private ShipmentEventRepository eventRepository;

    @Autowired
    private TransitIssueRepository issueRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private LiveTrackingService liveTrackingService;

    @Autowired
    private StorageService storageService;

    public List<Shipment> getAllShipments() {
        return shipmentRepository.findAll();
    }

    public Optional<Shipment> getShipmentByTrackingNumber(String trackingNumber) {
        return shipmentRepository.findByTrackingNumber(trackingNumber);
    }

    public Optional<Shipment> getShipmentById(String id) {
        return shipmentRepository.findById(id);
    }

    public List<ShipmentEvent> getShipmentEvents(String shipmentId) {
        return eventRepository.findByShipmentIdOrderByTimestampAsc(shipmentId);
    }

    public List<TransitIssue> getShipmentIssues(String shipmentId) {
        return issueRepository.findByShipmentId(shipmentId);
    }

    public List<ChatMessage> getShipmentChatMessages(String shipmentId) {
        return chatMessageRepository.findByShipmentIdOrderByTimestampAsc(shipmentId);
    }

    @Transactional
    public Shipment createShipment(ShipmentDTO.CreateRequest request) {
        String id = "ship-" + UUID.randomUUID().toString().substring(0, 8);
        String trackingNumber = "STP-" + ((int) (Math.random() * 9000) + 1000) + "-IN";
        String now = LocalDateTime.now().format(FORMATTER);
        String eta = LocalDateTime.now().plusDays(2).format(FORMATTER);

        Shipment shipment = new Shipment();
        shipment.setId(id);
        shipment.setTrackingNumber(trackingNumber);
        shipment.setCompanyName(request.getCompanyName());
        shipment.setCreatedByUser(request.getCreatedByUser());
        shipment.setSenderName(request.getSenderName());
        shipment.setSenderPhone(request.getSenderPhone());
        shipment.setSenderEmail(request.getSenderEmail());
        shipment.setSenderAddress(request.getSenderAddress());

        shipment.setReceiverName(request.getReceiverName());
        shipment.setReceiverPhone(request.getReceiverPhone());
        shipment.setReceiverEmail(request.getReceiverEmail());
        shipment.setReceiverAddress(request.getReceiverAddress());

        shipment.setStatus(ShipmentStatus.CREATED);
        shipment.setPriority(PriorityLevel.fromDisplayName(request.getPriority()));
        shipment.setWeightKg(request.getWeightKg());
        shipment.setPackageType(request.getPackageType());
        shipment.setDimensionsCm(request.getDimensionsCm());
        shipment.setDeclaredValueUsd(request.getDeclaredValueUsd());
        shipment.setContentsDescription(request.getContentsDescription());
        shipment.setIsFragile(request.getIsFragile());
        shipment.setIsHazardous(request.getIsHazardous());
        shipment.setSpecialHandlingNotes(request.getSpecialHandlingNotes());
        shipment.setCreatedAt(now);
        shipment.setEstimatedDeliveryTime(eta);
        shipment.setAiPredictedDelayRisk("Low");
        shipment.setCurrentLocation(request.getSenderAddress());
        shipment.setDispatchStatus(DispatchStatus.UNASSIGNED);

        Shipment saved = shipmentRepository.save(shipment);

        // Add initial event
        eventRepository.save(new ShipmentEvent(
                "evt-" + UUID.randomUUID().toString().substring(0, 8),
                saved.getId(),
                ShipmentStatus.CREATED,
                now,
                request.getSenderAddress() != null ? request.getSenderAddress().getCity() : "Origin Warehouse",
                "Shipment order registered in ShipTrack Pro logistics network.",
                "System Automation"
        ));

        // Trigger notification
        notificationService.sendNotification(
                saved.getTrackingNumber(),
                "Shipment Order Created",
                "New shipment #" + saved.getTrackingNumber() + " successfully registered for pickup.",
                "success",
                "Shipment Update",
                "Email,SMS,Push,In-App",
                saved.getSenderEmail(),
                saved.getSenderPhone()
        );

        return saved;
    }

    @Transactional
    public Shipment updateShipment(String id, Shipment updated) {
        Shipment existing = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));

        if (updated.getReceiverName() != null) existing.setReceiverName(updated.getReceiverName());
        if (updated.getReceiverPhone() != null) existing.setReceiverPhone(updated.getReceiverPhone());
        if (updated.getReceiverAddress() != null) existing.setReceiverAddress(updated.getReceiverAddress());
        if (updated.getPriority() != null) existing.setPriority(updated.getPriority());
        if (updated.getSpecialHandlingNotes() != null) existing.setSpecialHandlingNotes(updated.getSpecialHandlingNotes());
        if (updated.getEstimatedDeliveryTime() != null) existing.setEstimatedDeliveryTime(updated.getEstimatedDeliveryTime());

        return shipmentRepository.save(existing);
    }

    @Transactional
    public Shipment cancelShipment(String id, String reason) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));

        String now = LocalDateTime.now().format(FORMATTER);
        shipment.setStatus(ShipmentStatus.CANCELLED);
        shipment.setCancellationReason(reason != null ? reason : "Cancelled by client/operator");
        shipment.setCancelledAt(now);

        Shipment saved = shipmentRepository.save(shipment);

        eventRepository.save(new ShipmentEvent(
                "evt-" + UUID.randomUUID().toString().substring(0, 8),
                saved.getId(),
                ShipmentStatus.CANCELLED,
                now,
                saved.getCurrentLocation() != null ? saved.getCurrentLocation().getCity() : "Regional Center",
                "Shipment marked as Cancelled. Reason: " + shipment.getCancellationReason(),
                "Support Agent / Admin"
        ));

        return saved;
    }

    @Transactional
    public Shipment assignOperator(String id, ShipmentDTO.AssignOperatorRequest request) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));

        String now = LocalDateTime.now().format(FORMATTER);
        shipment.setAssignedOperatorId(request.getOperatorId());
        shipment.setAssignedOperatorName(request.getOperatorName());
        shipment.setPickupWindow(request.getPickupWindow() != null ? request.getPickupWindow() : "Today, 14:00 - 16:00");
        shipment.setDispatchStatus(DispatchStatus.PENDING_ACCEPTANCE);
        shipment.setDispatchAssignedAt(now);

        // Assign driver details
        Driver driver = new Driver(
                request.getOperatorId(),
                request.getOperatorName(),
                "+91 98765 43210",
                "Mahindra Furio Cargo Truck (#" + (100 + (int)(Math.random()*800)) + ")",
                "MH-12-TR-" + (1000 + (int)(Math.random()*9000))
        );
        if (shipment.getCurrentLocation() != null) {
            driver.setCurrentLat(shipment.getCurrentLocation().getLat());
            driver.setCurrentLng(shipment.getCurrentLocation().getLng());
        }
        driver.setLastSignalTime("Just now");
        shipment.setDriver(driver);

        Shipment saved = shipmentRepository.save(shipment);

        eventRepository.save(new ShipmentEvent(
                "evt-" + UUID.randomUUID().toString().substring(0, 8),
                saved.getId(),
                saved.getStatus(),
                now,
                saved.getCurrentLocation() != null ? saved.getCurrentLocation().getCity() : "Hub",
                "Dispatch offer sent to operator " + request.getOperatorName() + ". Awaiting acceptance.",
                "Control Tower Dispatcher"
        ));

        return saved;
    }

    @Transactional
    public Shipment respondToDispatch(String id, ShipmentDTO.DispatchResponseRequest request) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));

        String now = LocalDateTime.now().format(FORMATTER);

        if ("accept".equalsIgnoreCase(request.getAction())) {
            shipment.setDispatchStatus(DispatchStatus.ACCEPTED);
            if (shipment.getStatus() == ShipmentStatus.CREATED) {
                shipment.setStatus(ShipmentStatus.PICKED_UP);
            }

            eventRepository.save(new ShipmentEvent(
                    "evt-" + UUID.randomUUID().toString().substring(0, 8),
                    shipment.getId(),
                    shipment.getStatus(),
                    now,
                    shipment.getCurrentLocation() != null ? shipment.getCurrentLocation().getCity() : "Depot Hub",
                    "Operator " + (shipment.getAssignedOperatorName() != null ? shipment.getAssignedOperatorName() : "Assigned Courier") + " accepted dispatch assignment.",
                    shipment.getAssignedOperatorName() != null ? shipment.getAssignedOperatorName() : "Operator"
            ));
        } else {
            shipment.setDispatchStatus(DispatchStatus.DECLINED);
            shipment.setDispatchDeclinedReason(request.getReason() != null ? request.getReason() : "Operator unavailable");

            eventRepository.save(new ShipmentEvent(
                    "evt-" + UUID.randomUUID().toString().substring(0, 8),
                    shipment.getId(),
                    shipment.getStatus(),
                    now,
                    shipment.getCurrentLocation() != null ? shipment.getCurrentLocation().getCity() : "Depot Hub",
                    "Operator declined dispatch offer. Reason: " + shipment.getDispatchDeclinedReason(),
                    shipment.getAssignedOperatorName() != null ? shipment.getAssignedOperatorName() : "Operator"
            ));
        }

        return shipmentRepository.save(shipment);
    }

    @Transactional
    public Shipment updateStatus(String id, ShipmentDTO.StatusUpdateRequest request) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));

        String now = LocalDateTime.now().format(FORMATTER);
        ShipmentStatus newStatus = ShipmentStatus.fromDisplayName(request.getStatus());
        shipment.setStatus(newStatus);

        if (request.getFailedReason() != null) {
            shipment.setFailedReason(request.getFailedReason());
            shipment.setFailedNotes(request.getFailedNotes());
        }

        Shipment saved = shipmentRepository.save(shipment);

        eventRepository.save(new ShipmentEvent(
                "evt-" + UUID.randomUUID().toString().substring(0, 8),
                saved.getId(),
                newStatus,
                now,
                request.getLocation() != null ? request.getLocation() : "Logistics Hub",
                request.getNote() != null ? request.getNote() : "Shipment status updated to " + newStatus.getDisplayName(),
                request.getUpdatedBy() != null ? request.getUpdatedBy() : "Logistics Operator"
        ));

        return saved;
    }

    @Transactional
    public Shipment updateTelemetry(String id, ShipmentDTO.TelemetryUpdateRequest request) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));

        if (shipment.getDriver() != null) {
            shipment.getDriver().setCurrentLat(request.getLat());
            shipment.getDriver().setCurrentLng(request.getLng());
            if (request.getSpeedKmH() != null) shipment.getDriver().setSpeedKmH(request.getSpeedKmH());
            if (request.getBatteryPct() != null) shipment.getDriver().setBatteryPct(request.getBatteryPct());
            shipment.getDriver().setLastSignalTime("Just now");
        }

        if (shipment.getCurrentLocation() != null) {
            shipment.getCurrentLocation().setLat(request.getLat());
            shipment.getCurrentLocation().setLng(request.getLng());
            if (request.getCity() != null) shipment.getCurrentLocation().setCity(request.getCity());
        }

        liveTrackingService.updateDriverTelemetry(id, request);
        return shipmentRepository.save(shipment);
    }

    @Transactional
    public Shipment submitProofOfDelivery(String id, ProofOfDelivery pod) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));

        String now = LocalDateTime.now().format(FORMATTER);
        pod.setDeliveredAt(now);
        pod.setVerificationStatus("VERIFIED");

        // Process images through storage service
        if (pod.getSignatureImageUrl() != null) {
            pod.setSignatureImageUrl(storageService.storeBase64Image(pod.getSignatureImageUrl(), "sig-" + shipment.getTrackingNumber()));
        }
        if (pod.getDeliveryPhotoUrl() != null) {
            pod.setDeliveryPhotoUrl(storageService.storeBase64Image(pod.getDeliveryPhotoUrl(), "pod-" + shipment.getTrackingNumber()));
        }
        if (pod.getDeliveredPackagePhotoUrl() != null) {
            pod.setDeliveredPackagePhotoUrl(storageService.storeBase64Image(pod.getDeliveredPackagePhotoUrl(), "doorstep-" + shipment.getTrackingNumber()));
        }

        shipment.setProofOfDelivery(pod);
        shipment.setStatus(ShipmentStatus.DELIVERED);

        Shipment saved = shipmentRepository.save(shipment);

        eventRepository.save(new ShipmentEvent(
                "evt-" + UUID.randomUUID().toString().substring(0, 8),
                saved.getId(),
                ShipmentStatus.DELIVERED,
                now,
                saved.getReceiverAddress() != null ? saved.getReceiverAddress().getCity() : "Destination Address",
                "Package delivered successfully. Signee: " + pod.getRecipientName() + " (OTP: " + pod.getVerificationCode() + ")",
                "Driver Operator"
        ));

        notificationService.sendNotification(
                saved.getTrackingNumber(),
                "Package Delivered Successfully",
                "Shipment #" + saved.getTrackingNumber() + " was delivered to " + pod.getRecipientName() + ".",
                "success",
                "Delivery Alert",
                "Email,SMS,Push,In-App",
                saved.getReceiverEmail(),
                saved.getReceiverPhone()
        );

        return saved;
    }

    @Transactional
    public TransitIssue reportIssue(String id, ShipmentDTO.IssueReportRequest request) {
        String now = LocalDateTime.now().format(FORMATTER);
        TransitIssue issue = new TransitIssue(
                "iss-" + UUID.randomUUID().toString().substring(0, 8),
                id,
                request.getIssueType(),
                request.getNotes(),
                request.getReportedBy(),
                now
        );
        issue.setPhotoUrl(storageService.storeBase64Image(request.getPhotoUrl(), "issue-" + id));

        TransitIssue saved = issueRepository.save(issue);

        eventRepository.save(new ShipmentEvent(
                "evt-" + UUID.randomUUID().toString().substring(0, 8),
                id,
                ShipmentStatus.IN_TRANSIT,
                now,
                "Transit Route",
                "Transit Issue Logged: [" + request.getIssueType() + "] - " + request.getNotes(),
                request.getReportedBy()
        ));

        return saved;
    }

    @Transactional
    public ChatMessage sendChatMessage(String id, ShipmentDTO.ChatMessageRequest request) {
        String now = LocalDateTime.now().format(FORMATTER);
        ChatMessage msg = new ChatMessage(
                "msg-" + UUID.randomUUID().toString().substring(0, 8),
                id,
                request.getSenderName(),
                request.getSenderRole(),
                request.getText(),
                now
        );
        return chatMessageRepository.save(msg);
    }

    @Transactional
    public Shipment verifyPod(String id, String verificationStatus, String auditNotes, String verifiedBy) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));
        if (shipment.getProofOfDelivery() != null) {
            shipment.getProofOfDelivery().setVerificationStatus(verificationStatus != null ? verificationStatus : "VERIFIED");
            if (auditNotes != null) {
                shipment.getProofOfDelivery().setNotes(auditNotes);
            }
            if (verifiedBy != null) {
                shipment.getProofOfDelivery().setVerifiedByUserId(verifiedBy);
            }
        }
        String now = LocalDateTime.now().format(FORMATTER);
        eventRepository.save(new ShipmentEvent(
                "evt-" + UUID.randomUUID().toString().substring(0, 8),
                id,
                shipment.getStatus(),
                now,
                "Support Desk",
                "Proof of Delivery marked as " + verificationStatus + ". " + (auditNotes != null ? auditNotes : ""),
                verifiedBy != null ? verifiedBy : "Support Agent"
        ));
        return shipmentRepository.save(shipment);
    }

    @Transactional
    public TransitIssue resolveIssue(String shipmentId, String issueId, String status, String notes, String resolvedBy) {
        TransitIssue issue = issueRepository.findById(issueId)
                .orElseGet(() -> new TransitIssue(issueId, shipmentId, "General Issue", notes, resolvedBy, LocalDateTime.now().format(FORMATTER)));
        issue.setStatus(status != null ? status : "Resolved");
        issue.setResolutionNotes(notes);
        issue.setResolvedBy(resolvedBy);
        issue.setResolvedAt(LocalDateTime.now().format(FORMATTER));
        return issueRepository.save(issue);
    }

    @Transactional
    public Shipment recordPickupPhoto(String id, String pickupPhotoUrl, String note) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shipment not found with id: " + id));
        if (shipment.getProofOfDelivery() == null) {
            shipment.setProofOfDelivery(new ProofOfDelivery());
        }
        String storedUrl = storageService.storeBase64Image(pickupPhotoUrl, "pickup-" + shipment.getTrackingNumber());
        shipment.setPickupPhotoUrl(storedUrl);

        if (note != null) {
            shipment.getProofOfDelivery().setNotes(note);
        }
        return shipmentRepository.save(shipment);
    }
}
