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
public class DriverRouteHistoryResponse {

    private Long shipmentId;

    private String trackingNumber;

    private String sourceAddress;

    private String destinationAddress;

    private String receiverName;

    private Double travelDistanceKm;

    private Long travelTimeMinutes;

    private LocalDateTime deliveredAt;
}
