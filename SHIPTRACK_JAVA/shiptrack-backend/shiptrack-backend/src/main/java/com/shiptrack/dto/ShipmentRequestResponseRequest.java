package com.shiptrack.dto;

public class ShipmentRequestResponseRequest {

    private boolean shipmentCreated;
    private String message;

    public boolean isShipmentCreated() {
        return shipmentCreated;
    }

    public void setShipmentCreated(boolean shipmentCreated) {
        this.shipmentCreated = shipmentCreated;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
