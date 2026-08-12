package com.shiptrack.dto.driver;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverPerformanceResponse {

    private Long driverId;

    private String driverName;

    private Long totalShipments;

    private Long completedDeliveries;

    private Long failedDeliveries;

    private Long cancelled;

    private Long pending;

    private Long inProgress;

    private Long completedToday;

    private Double onTimeRate;

    private Long avgDeliveryMinutes;

    private Double totalDistanceKm;
}
