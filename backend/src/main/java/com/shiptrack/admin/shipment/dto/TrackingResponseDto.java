package com.shiptrack.admin.shipment.dto;

import com.shiptrack.admin.shipment.entity.ShipmentStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TrackingResponseDto {
    private String trackingId;
    private ShipmentStatus status;
    private Double currentLatitude;
    private Double currentLongitude;
    private String currentLocationName;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private Double truckSpeed;
    private Double remainingDistanceKm;
    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime lastLocationUpdate;
}