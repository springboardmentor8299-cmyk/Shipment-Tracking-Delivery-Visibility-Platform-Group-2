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
public class EtaResponse {
    private LocalDateTime estimatedDeliveryTime;
    private Long estimatedDurationMin;
    private Double totalDistanceKm;
    private LocalDateTime lastRecalculatedAt;
}
