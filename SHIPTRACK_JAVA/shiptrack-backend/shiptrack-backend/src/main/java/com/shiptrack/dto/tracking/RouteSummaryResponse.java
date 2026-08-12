package com.shiptrack.dto.tracking;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteSummaryResponse {

    private Long shipmentId;

    private String trackingNumber;

    private Long driverId;

    private String driverName;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Long totalStops;

    private Double totalDistanceKm;

    private Long totalDurationMinutes;
}
