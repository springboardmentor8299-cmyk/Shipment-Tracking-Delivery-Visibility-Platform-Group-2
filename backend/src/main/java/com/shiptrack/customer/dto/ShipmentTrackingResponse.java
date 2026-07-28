package com.shiptrack.customer.dto;

import java.time.LocalDate;

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

}