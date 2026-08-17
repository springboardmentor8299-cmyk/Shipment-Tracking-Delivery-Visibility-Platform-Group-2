package com.shiptrack.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnalyticsResponse {

    private long totalShipments;

    private long delivered;

    private long inTransit;

    private long pending;

    private double deliverySuccessRate;

}