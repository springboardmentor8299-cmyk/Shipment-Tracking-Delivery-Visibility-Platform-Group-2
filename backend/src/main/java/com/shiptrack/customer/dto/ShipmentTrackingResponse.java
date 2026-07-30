package com.shiptrack.customer.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.shiptrack.admin.shipment.entity.ShipmentStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ShipmentTrackingResponse {

    private String trackingId;
    private String customerName;
    private String origin;
    private String destination;
    private ShipmentStatus status;
    private LocalDate shipmentDate;
    private LocalDate deliveryDate;

    // Live tracking details — needed to show a real per-step timeline
    // (current truck location + when it was last updated, ETA for the
    // "Destination Hub" step before the shipment is actually delivered).
    private String currentLocationName;
    private LocalDateTime lastLocationUpdate;
    private LocalDateTime estimatedDeliveryTime;

}