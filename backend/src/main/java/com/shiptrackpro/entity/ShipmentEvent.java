package com.shiptrackpro.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "shipment_events")
public class ShipmentEvent {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "shipment_id", length = 64, nullable = false)
    private String shipmentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ShipmentStatus status;

    @Column(nullable = false)
    private String timestamp;

    private String location;

    @Column(length = 1024)
    private String description;

    private String updatedBy;

    public ShipmentEvent() {}

    public ShipmentEvent(String id, String shipmentId, ShipmentStatus status, String timestamp, String location, String description, String updatedBy) {
        this.id = id;
        this.shipmentId = shipmentId;
        this.status = status;
        this.timestamp = timestamp;
        this.location = location;
        this.description = description;
        this.updatedBy = updatedBy;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getShipmentId() { return shipmentId; }
    public void setShipmentId(String shipmentId) { this.shipmentId = shipmentId; }

    public ShipmentStatus getStatus() { return status; }
    public void setStatus(ShipmentStatus status) { this.status = status; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
