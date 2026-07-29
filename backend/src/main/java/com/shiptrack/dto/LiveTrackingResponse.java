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
public class LiveTrackingResponse {
    private Long shipmentId;
    private String trackingNumber;
    private String status;
    private Double latitude;
    private Double longitude;
    private Double originLatitude;
    private Double originLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private LocalDateTime estimatedDeliveryTime;
    private Long estimatedDuration;
    private Double totalDistance;
    private String routePolyline;
    private String senderName;
    private String receiverName;
    private String senderAddress;
    private String deliveryAddress;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdatedAt;
    private List<TrackingEventResponse> recentEvents;
}
