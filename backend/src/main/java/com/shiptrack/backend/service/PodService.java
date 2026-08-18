package com.shiptrack.backend.service;

import com.shiptrack.backend.entity.PodRecord;
import com.shiptrack.backend.entity.Shipment;
import com.shiptrack.backend.repository.PodRecordRepository;
import com.shiptrack.backend.repository.ShipmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class PodService {

    private final PodRecordRepository podRecordRepository;
    private final ShipmentRepository shipmentRepository;
    private final RouteHistoryService routeHistoryService;

    public PodService(PodRecordRepository podRecordRepository,
                      ShipmentRepository shipmentRepository,
                      RouteHistoryService routeHistoryService) {
        this.podRecordRepository = podRecordRepository;
        this.shipmentRepository = shipmentRepository;
        this.routeHistoryService = routeHistoryService;
    }

    public Optional<PodRecord> getPodByShipmentId(Long shipmentId) {
        return podRecordRepository.findByShipmentId(shipmentId);
    }

    @Transactional
    public PodRecord saveSignature(Long shipmentId, String signatureData) {
        PodRecord record = podRecordRepository.findByShipmentId(shipmentId)
                .orElseGet(() -> {
                    PodRecord r = new PodRecord();
                    r.setShipmentId(shipmentId);
                    r.setStatus("PENDING_CAPTURE");
                    return r;
                });

        record.setSignatureUrl(signatureData);
        if ("PENDING_CAPTURE".equals(record.getStatus())) {
            record.setStatus("CAPTURED");
        }
        return podRecordRepository.save(record);
    }

    @Transactional
    public PodRecord savePhoto(Long shipmentId, String photoUrl) {
        PodRecord record = podRecordRepository.findByShipmentId(shipmentId)
                .orElseGet(() -> {
                    PodRecord r = new PodRecord();
                    r.setShipmentId(shipmentId);
                    r.setStatus("PENDING_CAPTURE");
                    return r;
                });

        String existingPhotos = record.getPhotoUrls();
        if (existingPhotos == null || existingPhotos.isBlank()) {
            record.setPhotoUrls(photoUrl);
        } else {
            record.setPhotoUrls(existingPhotos + "," + photoUrl);
        }

        if ("PENDING_CAPTURE".equals(record.getStatus())) {
            record.setStatus("CAPTURED");
        }
        return podRecordRepository.save(record);
    }

    @Transactional
    public PodRecord confirmDelivery(Long shipmentId, Map<String, Object> payload) {
        PodRecord record = podRecordRepository.findByShipmentId(shipmentId)
                .orElseGet(() -> {
                    PodRecord r = new PodRecord();
                    r.setShipmentId(shipmentId);
                    return r;
                });

        if (payload.containsKey("signatureData") && payload.get("signatureData") != null) {
            record.setSignatureUrl((String) payload.get("signatureData"));
        }
        if (payload.containsKey("photoUrls") && payload.get("photoUrls") != null) {
            record.setPhotoUrls((String) payload.get("photoUrls"));
        }
        if (payload.containsKey("recipientName") && payload.get("recipientName") != null) {
            record.setRecipientName((String) payload.get("recipientName"));
        }
        if (payload.containsKey("deliveryAgentId") && payload.get("deliveryAgentId") != null) {
            record.setDeliveryAgentId(Long.valueOf(payload.get("deliveryAgentId").toString()));
        }
        if (payload.containsKey("geoLat") && payload.get("geoLat") != null) {
            record.setGeoLat(Double.valueOf(payload.get("geoLat").toString()));
        }
        if (payload.containsKey("geoLng") && payload.get("geoLng") != null) {
            record.setGeoLng(Double.valueOf(payload.get("geoLng").toString()));
        }
        if (payload.containsKey("notes") && payload.get("notes") != null) {
            record.setNotes((String) payload.get("notes"));
        }

        record.setCapturedAt(LocalDateTime.now());
        record.setStatus("CAPTURED");

        // Trigger Shipment status update to DELIVERED
        Optional<Shipment> shipmentOpt = shipmentRepository.findById(shipmentId);
        if (shipmentOpt.isPresent()) {
            Shipment shipment = shipmentOpt.get();
            shipment.setStatus("DELIVERED");
            if (record.getGeoLat() != null && record.getGeoLng() != null) {
                shipment.setLatitude(record.getGeoLat());
                shipment.setLongitude(record.getGeoLng());
            }
            shipmentRepository.save(shipment);

            // Record final route snapshot
            routeHistoryService.recordSnapshot(
                    shipmentId,
                    shipment.getLatitude(),
                    shipment.getLongitude(),
                    "DELIVERED",
                    "Delivered to recipient: " + (record.getRecipientName() != null ? record.getRecipientName() : shipment.getReceiverName())
            );

            System.out.println("[NOTIFICATION SERVICE] Fire delivery confirmation push/email/SMS for Shipment: "
                    + shipment.getTrackingNumber() + " to " + shipment.getReceiverName());
        }

        return podRecordRepository.save(record);
    }

    @Transactional
    public PodRecord verifyPod(Long shipmentId, String status, String verifiedBy, String notes) {
        PodRecord record = podRecordRepository.findByShipmentId(shipmentId)
                .orElseThrow(() -> new RuntimeException("POD record not found for shipment " + shipmentId));

        record.setStatus(status); // VERIFIED, DISPUTED, RESOLVED
        record.setVerifiedBy(verifiedBy);
        record.setVerifiedAt(LocalDateTime.now());
        if (notes != null && !notes.isBlank()) {
            record.setNotes((record.getNotes() != null ? record.getNotes() + " | " : "") + notes);
        }

        System.out.println("[POD AUDIT LOG] POD for Shipment #" + shipmentId + " set to " + status + " by " + verifiedBy);
        return podRecordRepository.save(record);
    }

    public List<PodRecord> getDisputedPods() {
        return podRecordRepository.findByStatus("DISPUTED");
    }

    public List<PodRecord> getPodsByAgentId(Long agentId) {
        return podRecordRepository.findByDeliveryAgentId(agentId);
    }
}
