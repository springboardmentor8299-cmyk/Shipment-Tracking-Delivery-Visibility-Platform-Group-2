package com.shiptrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastResponse {
    private LocalDateTime predictedDeliveryTime;
    private Double confidenceScore;
    private Double routeDistance;
    private Long routeDuration;
    private String trafficCondition;
    private LocalDateTime predictionGeneratedAt;
}
