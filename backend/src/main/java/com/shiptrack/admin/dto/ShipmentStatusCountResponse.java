package com.shiptrack.admin.dto;

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
public class ShipmentStatusCountResponse {

    private ShipmentStatus status;
    private long count;

}