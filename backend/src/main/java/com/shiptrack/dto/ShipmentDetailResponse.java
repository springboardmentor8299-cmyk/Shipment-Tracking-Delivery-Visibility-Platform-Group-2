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
public class ShipmentDetailResponse {

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

    private Double originLatitude;
    private Double originLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;

    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime actualDeliveryTime;
    private Long estimatedDuration;
    private Double totalDistance;

    private List<TrackingEventResponse> events;

    private EtaResponse eta;
    private ForecastResponse forecast;
    private DelayStatusResponse delayStatus;

    private Double latestLatitude;
    private Double latestLongitude;
    private String latestLocationStatus;
    private LocalDateTime latestEventAt;
}