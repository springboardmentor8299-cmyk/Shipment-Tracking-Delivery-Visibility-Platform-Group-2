package com.shiptrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentResponse {

    private Long id;
    private String trackingNumber;
    private String senderName;
    private String senderAddress;
    private String receiverName;
    private String deliveryAddress;
    private String status;
    private int progressPercent;
    private String createdByName;
    private LocalDateTime createdAt;

    // Latest known location, derived from the most recent tracking event (nullable)
    private Double latestLatitude;
    private Double latestLongitude;
    private String latestLocationStatus;
    private LocalDateTime latestEventAt;

    // Geocoded origin / destination coordinates
    private Double originLatitude;
    private Double originLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;

    // ETA / delivery info
    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime actualDeliveryTime;
    private Long estimatedDuration;
    private Double totalDistance;

    // Verification status of the shipment's proof of delivery, if one exists (nullable)
    private String podVerificationStatus;

    // Included only on detail/track responses
    private List<TrackingEventResponse> events;
}
