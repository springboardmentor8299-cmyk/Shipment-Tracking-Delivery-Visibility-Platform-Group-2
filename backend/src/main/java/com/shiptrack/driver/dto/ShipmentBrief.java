package com.shiptrack.driver.dto;

import com.shiptrack.admin.shipment.entity.ShipmentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentBrief {

    private Long id;

    private String trackingId;

    private String origin;

    private String destination;

    private ShipmentStatus status;

}
