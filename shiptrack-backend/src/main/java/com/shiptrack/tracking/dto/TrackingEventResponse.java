package com.shiptrack.tracking.dto;

import com.shiptrack.shipment.ShipmentStatus;

import java.time.LocalDateTime;

public class TrackingEventResponse {

    private ShipmentStatus status;
    private String location;
    private LocalDateTime eventTime;

    public ShipmentStatus getStatus() {
        return status;
    }

    public void setStatus(ShipmentStatus status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getEventTime() {
        return eventTime;
    }

    public void setEventTime(LocalDateTime eventTime) {
        this.eventTime = eventTime;
    }
}