package com.shiptrack.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LiveTrackingService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastLocationUpdate(Long shipmentId, Double latitude, Double longitude, String status) {
        broadcastLocationUpdate(shipmentId, latitude, longitude, status, null, null, null);
    }

    public void broadcastLocationUpdate(Long shipmentId, Double latitude, Double longitude,
                                         String status, Double speed,
                                         Double progress, Long estimatedDuration) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("shipmentId", shipmentId);
        payload.put("latitude", latitude);
        payload.put("longitude", longitude);
        payload.put("status", status);
        payload.put("timestamp", LocalDateTime.now().toString());
        if (speed != null) payload.put("speed", speed);
        if (progress != null) payload.put("progress", progress);
        if (estimatedDuration != null) payload.put("estimatedDuration", estimatedDuration);
        messagingTemplate.convertAndSend("/topic/tracking/" + shipmentId, payload);
        log.info("Broadcast location update for shipment {}: {},{}", shipmentId, latitude, longitude);
    }

    public void broadcastEtaUpdate(Long shipmentId, LocalDateTime eta) {
        Map<String, Object> payload = Map.of(
                "shipmentId", shipmentId,
                "estimatedDeliveryTime", eta.toString(),
                "timestamp", LocalDateTime.now().toString()
        );
        messagingTemplate.convertAndSend("/topic/eta/" + shipmentId, payload);
    }

    public void broadcastNewShipmentAlert(Long shipmentId, String trackingNumber, String senderName, String receiverName) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "new_shipment");
        payload.put("shipmentId", shipmentId);
        payload.put("trackingNumber", trackingNumber);
        payload.put("senderName", senderName);
        payload.put("receiverName", receiverName);
        payload.put("timestamp", LocalDateTime.now().toString());
        messagingTemplate.convertAndSend("/topic/admin/alerts", payload);
        log.info("New shipment alert broadcast: {} ({})", trackingNumber, shipmentId);
    }

    public void broadcastDelayAlert(Long shipmentId, String reason, Integer delayMinutes, Double probability) {
        Map<String, Object> payload = Map.of(
                "shipmentId", shipmentId,
                "delayReason", reason,
                "delayMinutes", delayMinutes,
                "probability", probability,
                "timestamp", LocalDateTime.now().toString()
        );
        messagingTemplate.convertAndSend("/topic/delay/" + shipmentId, payload);
        messagingTemplate.convertAndSend("/topic/admin/alerts", payload);
        log.warn("Delay alert for shipment {}: {} ({} min, {}% probability)",
                shipmentId, reason, delayMinutes, probability);
    }
}
