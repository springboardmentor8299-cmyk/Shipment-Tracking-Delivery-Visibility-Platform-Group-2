package com.shiptrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPerformanceReport {
    private LocalDate periodFrom;
    private LocalDate periodTo;
    private List<DeliveryPerformanceReport> rows;
    private long totalShipments;
    private long delivered;
    private long onTime;
    private long late;
    private Double onTimeRate;
    private Double avgDeliveryHours;
    private Double avgDistanceKm;
    private long cancelled;
    private long created;
    private long pickedUp;
    private long atSortingFacility;
    private long inTransit;
    private long outForDelivery;
    private long returned;
}
