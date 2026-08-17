package com.shiptrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class ReportResponse {

    private long totalShipments;
    private long delivered;
    private long inTransit;
    private long pending;

    private long totalDrivers;
    private long totalCustomers;

    // ⭐ New Fields
    private long delayedShipments;
    private double successRate;
    private double averageDeliveryTime;
    private String topDriver;

    // Existing Fields
    private Map<String, Long> driverPerformance;
    private Map<String, Long> monthlyShipments;
}