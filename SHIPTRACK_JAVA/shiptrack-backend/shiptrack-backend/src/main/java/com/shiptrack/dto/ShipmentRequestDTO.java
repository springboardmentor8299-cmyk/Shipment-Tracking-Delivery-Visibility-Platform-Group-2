package com.shiptrack.dto;

import java.time.LocalDateTime;

public class ShipmentRequestDTO {

    private Long id;
    private String senderName;
    private String receiverName;
    private String customerEmail;
    private String customerPhone;
    private String sourceAddress;
    private String destinationAddress;
    private Double packageWeight;
    private String requestedStatus;
    private LocalDateTime createdAt;
    private String customerName;
    private boolean responseSent;
    private boolean shipmentCreated;
    private String responseMessage;
    private Long createdShipmentId;
    private LocalDateTime respondedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public String getSourceAddress() { return sourceAddress; }
    public void setSourceAddress(String sourceAddress) { this.sourceAddress = sourceAddress; }
    public String getDestinationAddress() { return destinationAddress; }
    public void setDestinationAddress(String destinationAddress) { this.destinationAddress = destinationAddress; }
    public Double getPackageWeight() { return packageWeight; }
    public void setPackageWeight(Double packageWeight) { this.packageWeight = packageWeight; }
    public String getRequestedStatus() { return requestedStatus; }
    public void setRequestedStatus(String requestedStatus) { this.requestedStatus = requestedStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public boolean isResponseSent() { return responseSent; }
    public void setResponseSent(boolean responseSent) { this.responseSent = responseSent; }
    public boolean isShipmentCreated() { return shipmentCreated; }
    public void setShipmentCreated(boolean shipmentCreated) { this.shipmentCreated = shipmentCreated; }
    public String getResponseMessage() { return responseMessage; }
    public void setResponseMessage(String responseMessage) { this.responseMessage = responseMessage; }
    public Long getCreatedShipmentId() { return createdShipmentId; }
    public void setCreatedShipmentId(Long createdShipmentId) { this.createdShipmentId = createdShipmentId; }
    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
}
