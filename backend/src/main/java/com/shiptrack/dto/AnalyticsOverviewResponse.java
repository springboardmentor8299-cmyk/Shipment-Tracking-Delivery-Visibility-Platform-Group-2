package com.shiptrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsOverviewResponse {
    private long total;
    private Map<String, Long> byStatus;
    private long delivered;
    private long inTransit;
    private long outForDelivery;
    private long cancelled;
    private Double onTimeRate;
    private Double avgDeliveryHours;
    private Double avgDistanceKm;
    private Double totalDistanceKm;
}
