package com.shiptrack.admin.shipment.dto;

import com.shiptrack.admin.shipment.entity.ShipmentStatus;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    private ShipmentStatus status;
}