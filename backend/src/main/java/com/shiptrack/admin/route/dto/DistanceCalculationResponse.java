package com.shiptrack.admin.route.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DistanceCalculationResponse {

    private String origin;
    private Double originLatitude;
    private Double originLongitude;

    private String destination;
    private Double destinationLatitude;
    private Double destinationLongitude;

    // Actual road distance/time from the routing engine
    private Double drivingDistanceKm;
    private Double drivingDurationMinutes;

    // Straight-line (as-the-crow-flies) distance, always available as a fallback
    private Double straightLineDistanceKm;

}
