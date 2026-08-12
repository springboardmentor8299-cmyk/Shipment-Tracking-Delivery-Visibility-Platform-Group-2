package com.shiptrack.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "shipment_requests")
public class ShipmentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String senderName;

    @Column(nullable = false)
    private String receiverName;

    @Column(nullable = false)
    private String customerEmail;

    private String customerPhone;

    @Column(nullable = false)
    private String sourceAddress;

    @Column(nullable = false)
    private String destinationAddress;

    @Column(nullable = false)
    private Double packageWeight;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus requestedStatus = ShipmentStatus.CREATED;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private Boolean responseSent = false;

    private Boolean shipmentCreated = false;

    @Column(length = 1500)
    private String responseMessage;

    private Long createdShipmentId;

    private LocalDateTime respondedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Long getId() { return id; }
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
    public ShipmentStatus getRequestedStatus() { return requestedStatus; }
    public void setRequestedStatus(ShipmentStatus requestedStatus) { this.requestedStatus = requestedStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Boolean isResponseSent() { return responseSent; }
    public void setResponseSent(Boolean responseSent) { this.responseSent = responseSent; }
    public Boolean isShipmentCreated() { return shipmentCreated; }
    public void setShipmentCreated(Boolean shipmentCreated) { this.shipmentCreated = shipmentCreated; }
    public String getResponseMessage() { return responseMessage; }
    public void setResponseMessage(String responseMessage) { this.responseMessage = responseMessage; }
    public Long getCreatedShipmentId() { return createdShipmentId; }
    public void setCreatedShipmentId(Long createdShipmentId) { this.createdShipmentId = createdShipmentId; }
    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
