package com.shiptrackpro.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "shipment_id", length = 64, nullable = false)
    private String shipmentId;

    private String senderName;
    private String senderRole;

    @Column(length = 2048, nullable = false)
    private String text;

    private String timestamp;
    private Boolean readByDriver = false;
    private Boolean readByCustomer = false;

    public ChatMessage() {}

    public ChatMessage(String id, String shipmentId, String senderName, String senderRole, String text, String timestamp) {
        this.id = id;
        this.shipmentId = shipmentId;
        this.senderName = senderName;
        this.senderRole = senderRole;
        this.text = text;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getShipmentId() { return shipmentId; }
    public void setShipmentId(String shipmentId) { this.shipmentId = shipmentId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderRole() { return senderRole; }
    public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public Boolean getReadByDriver() { return readByDriver; }
    public void setReadByDriver(Boolean readByDriver) { this.readByDriver = readByDriver; }

    public Boolean getReadByCustomer() { return readByCustomer; }
    public void setReadByCustomer(Boolean readByCustomer) { this.readByCustomer = readByCustomer; }
}
