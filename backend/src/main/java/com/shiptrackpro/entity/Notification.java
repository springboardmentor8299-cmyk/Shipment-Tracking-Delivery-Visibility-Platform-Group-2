package com.shiptrackpro.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(nullable = false)
    private String title;

    @Column(length = 2048, nullable = false)
    private String message;

    private String type = "info"; // info, warning, success, alert
    private String category;
    private String channels; // Comma separated: Email,SMS,Push,In-App
    private String recipientEmail;
    private String recipientPhone;

    @Column(nullable = false)
    private String timestamp;

    @Column(name = "is_read")
    private Boolean read = false;

    private Boolean isDispatchAlert = false;
    private String dispatchShipmentId;
    private String dispatchStatus;
    private String pickupWindow;
    private String pickupLocation;
    private String dropoffLocation;
    private String priority;
    private String assignedToUserId;

    public Notification() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getChannels() { return channels; }
    public void setChannels(String channels) { this.channels = channels; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getRecipientPhone() { return recipientPhone; }
    public void setRecipientPhone(String recipientPhone) { this.recipientPhone = recipientPhone; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public Boolean getRead() { return read; }
    public void setRead(Boolean read) { this.read = read; }

    public Boolean getIsDispatchAlert() { return isDispatchAlert; }
    public void setIsDispatchAlert(Boolean isDispatchAlert) { this.isDispatchAlert = isDispatchAlert; }

    public String getDispatchShipmentId() { return dispatchShipmentId; }
    public void setDispatchShipmentId(String dispatchShipmentId) { this.dispatchShipmentId = dispatchShipmentId; }

    public String getDispatchStatus() { return dispatchStatus; }
    public void setDispatchStatus(String dispatchStatus) { this.dispatchStatus = dispatchStatus; }

    public String getPickupWindow() { return pickupWindow; }
    public void setPickupWindow(String pickupWindow) { this.pickupWindow = pickupWindow; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public String getDropoffLocation() { return dropoffLocation; }
    public void setDropoffLocation(String dropoffLocation) { this.dropoffLocation = dropoffLocation; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getAssignedToUserId() { return assignedToUserId; }
    public void setAssignedToUserId(String assignedToUserId) { this.assignedToUserId = assignedToUserId; }
}
