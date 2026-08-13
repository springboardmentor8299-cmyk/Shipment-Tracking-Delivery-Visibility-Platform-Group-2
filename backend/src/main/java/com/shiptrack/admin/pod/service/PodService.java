package com.shiptrack.admin.pod.service;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shiptrack.activity.service.ActivityService;
import com.shiptrack.admin.pod.dto.PodResponse;
import com.shiptrack.admin.pod.dto.PodSubmitRequest;
import com.shiptrack.admin.pod.entity.PodRecord;
import com.shiptrack.admin.pod.entity.VerificationMethod;
import com.shiptrack.admin.pod.repository.PodRecordRepository;
import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.repository.ShipmentRepository;
import com.shiptrack.notification.entity.NotificationType;
import com.shiptrack.notification.service.NotificationService;

@Service
public class PodService {

    private final PodRecordRepository podRecordRepository;
    private final ShipmentRepository shipmentRepository;
    private final FileStorageService fileStorageService;
    private final ActivityService activityService;
    private final NotificationService notificationService;
    private final PodOtpService podOtpService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public PodService(
            PodRecordRepository podRecordRepository,
            ShipmentRepository shipmentRepository,
            FileStorageService fileStorageService,
            ActivityService activityService,
            NotificationService notificationService,
            PodOtpService podOtpService) {
        this.podRecordRepository = podRecordRepository;
        this.shipmentRepository = shipmentRepository;
        this.fileStorageService = fileStorageService;
        this.activityService = activityService;
        this.notificationService = notificationService;
        this.podOtpService = podOtpService;
    }

    @Transactional
    public PodResponse submitPod(PodSubmitRequest request, String submittedBy) {

        Shipment shipment = shipmentRepository.findByTrackingId(request.getTrackingId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No shipment found with tracking ID " + request.getTrackingId()));

        if (request.getReceiverName() == null || request.getReceiverName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Receiver name is required");
        }

        VerificationMethod method = parseVerificationMethod(request.getVerificationMethod());

        if (method == VerificationMethod.OTP) {
            if (request.getVerificationCode() == null || request.getVerificationCode().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "verificationCode is required for OTP verification");
            }
            if (!podOtpService.isVerified(request.getTrackingId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "This shipment's OTP has not been verified yet. Verify the code before confirming delivery.");
            }
        }

        if (request.getSignature() == null || request.getSignature().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A signature is required to confirm delivery");
        }

        Map<String, Boolean> checklist = parseChecklist(request.getVerificationChecklist());

        String signatureUrl = fileStorageService.store(request.getSignature(), request.getTrackingId(), "signature");

        PodRecord record = PodRecord.builder()
                .shipment(shipment)
                .receiverName(request.getReceiverName().trim())
                .deliveryNotes(request.getDeliveryNotes())
                .verificationMethod(method)
                .verificationCode(request.getVerificationCode())
                .verificationChecklist(checklist)
                .signatureUrl(signatureUrl)
                .deliveredBy(submittedBy)
                .build();

        if (request.getPhotos() != null) {
            for (var photo : request.getPhotos()) {
                String photoUrl = fileStorageService.store(photo, request.getTrackingId(), "photo");
                if (photoUrl != null) {
                    record.getPhotoUrls().add(photoUrl);
                }
            }
        }

        PodRecord saved = podRecordRepository.save(record);

        activityService.save(submittedBy, "POD_SUBMITTED",
                "Proof of delivery captured for " + shipment.getTrackingId()
                        + " (received by " + record.getReceiverName() + ")");

        try {
            notificationService.notify(
                    shipment.getCustomerId(),
                    NotificationType.DELIVERY_ALERT,
                    "Shipment " + shipment.getTrackingId() + " delivery confirmed",
                    "Proof of delivery was recorded — received by " + record.getReceiverName() + ".",
                    shipment.getTrackingId());
        } catch (Exception ignored) {
        }

        if (method == VerificationMethod.OTP) {
            podOtpService.clear(request.getTrackingId());
        }

        return toResponse(saved);
    }

    public List<PodResponse> getAllPods() {
        return podRecordRepository.findAllByOrderByDeliveredAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PodResponse getLatestPodForTrackingId(String trackingId) {
        PodRecord record = podRecordRepository
                .findFirstByShipment_TrackingIdOrderByDeliveredAtDesc(trackingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No POD record found for tracking ID " + trackingId));
        return toResponse(record);
    }

    @Transactional
    public void deletePod(Long id) {
        PodRecord record = podRecordRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No POD record found with id " + id));

        fileStorageService.delete(record.getSignatureUrl());
        record.getPhotoUrls().forEach(fileStorageService::delete);

        podRecordRepository.delete(record);

        activityService.save(record.getDeliveredBy(), "POD_DELETED",
                "POD record removed for " + record.getShipment().getTrackingId());
    }

    // Helpers
    private VerificationMethod parseVerificationMethod(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "verificationMethod is required");
        }
        try {
            return VerificationMethod.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unknown verificationMethod: " + raw);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Boolean> parseChecklist(String rawJson) {
        if (rawJson == null || rawJson.isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(rawJson, Map.class);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "verificationChecklist must be a valid JSON object");
        }
    }

    private PodResponse toResponse(PodRecord record) {
        Shipment shipment = record.getShipment();
        return PodResponse.builder()
                .id(record.getId())
                .trackingId(shipment.getTrackingId())
                .customerName(shipment.getCustomerName())
                .receiverName(record.getReceiverName())
                .deliveryNotes(record.getDeliveryNotes())
                .verificationMethod(record.getVerificationMethod().name())
                .verificationCode(record.getVerificationCode())
                .verificationChecklist(record.getVerificationChecklist())
                .signatureUrl(record.getSignatureUrl())
                .photoUrls(record.getPhotoUrls())
                .deliveredAt(record.getDeliveredAt())
                .deliveredBy(record.getDeliveredBy())
                .origin(shipment.getOrigin())
                .destination(shipment.getDestination())
                .noOfItems(shipment.getNoOfItems())
                .totalWeightOfItems(shipment.getTotalWeightOfItems())
                .shipmentCost(shipment.getShipmentCost())
                .build();
    }

}
