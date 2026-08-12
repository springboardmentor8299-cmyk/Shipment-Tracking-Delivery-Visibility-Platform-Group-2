package com.shiptrack.dto.driver;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverShipmentResponse {

    private Long shipmentId;

    private String trackingNumber;

    private String senderName;

    private String receiverName;

    private String receiverAddress;

    private String sourceAddress;

    private String destinationAddress;

    private Double sourceLatitude;

    private Double sourceLongitude;

    private Double destinationLatitude;

    private Double destinationLongitude;

    private Double packageWeight;

    private Double distanceKm;

    private String shipmentStatus;

    private LocalDateTime createdAt;

    private LocalDateTime estimatedDeliveryAt;

    private Long delayMinutes;

    private Boolean reachedDestination;

    private String deliveryFailureReason;

    private String customerName;

    private String customerPhone;

    private String customerEmail;
}
