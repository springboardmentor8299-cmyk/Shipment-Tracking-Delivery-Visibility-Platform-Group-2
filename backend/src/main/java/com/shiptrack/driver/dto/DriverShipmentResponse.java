package com.shiptrack.driver.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.shiptrack.admin.shipment.entity.ShipmentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Fuller shipment view for the driver portal (current job + history rows) --
// ShipmentBrief is intentionally minimal for embedding inside DriverResponse,
// this carries what a driver actually needs to see/act on a job.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverShipmentResponse {

    private Long id;

    private String trackingId;

    private String customerName;

    private String receiverName;

    private String origin;

    private String destination;

    private ShipmentStatus status;

    private String noOfItems;

    private String totalWeightOfItems;

    private LocalDate shipmentDate;

    private LocalDate deliveryDate;

    private String currentLocationName;

    private LocalDateTime estimatedDeliveryTime;
}
