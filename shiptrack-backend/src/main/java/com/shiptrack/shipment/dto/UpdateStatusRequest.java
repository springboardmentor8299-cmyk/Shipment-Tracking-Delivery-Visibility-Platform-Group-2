package com.shiptrack.shipment.dto;

import com.shiptrack.shipment.ShipmentStatus;

public class UpdateStatusRequest {

    private ShipmentStatus status;

    public UpdateStatusRequest() {
    }

    public ShipmentStatus getStatus() {
        return status;
    }

    public void setStatus(ShipmentStatus status) {
        this.status = status;
    }
}