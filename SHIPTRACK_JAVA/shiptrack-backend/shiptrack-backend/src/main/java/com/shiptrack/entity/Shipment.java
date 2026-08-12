package com.shiptrack.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String trackingNumber;

    @Column(nullable = false)
    private String senderName;

    @Column(nullable = false)
    private String receiverName;

    @Column(nullable = false)
    private String receiverAddress;

    private String sourceAddress;

    private String destinationAddress;

    private Double sourceLatitude;
    private Double sourceLongitude;

    private Double destinationLatitude;
    private Double destinationLongitude;

    private Double packageWeight;

    private Double distanceKm;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus shipmentStatus;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime estimatedDeliveryAt;
    private Long estimatedMinutes;
    private Long delayMinutes;
    private Boolean reachedDestination = false;

    @Column(length = 500)
    private String deliveryFailureReason;

    private String customerPhone;

    private String customerEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private User driver;

    public Shipment() {
    }

    public Long getId() { return id; }
    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
    public String getReceiverAddress() { return receiverAddress; }
    public void setReceiverAddress(String receiverAddress) { this.receiverAddress = receiverAddress; }
    public String getSourceAddress() { return sourceAddress; }
    public void setSourceAddress(String sourceAddress) { this.sourceAddress = sourceAddress; }
    public String getDestinationAddress() { return destinationAddress; }
    public void setDestinationAddress(String destinationAddress) { this.destinationAddress = destinationAddress; }
    public Double getSourceLatitude() { return sourceLatitude; }
    public void setSourceLatitude(Double sourceLatitude) { this.sourceLatitude = sourceLatitude; }
    public Double getSourceLongitude() { return sourceLongitude; }
    public void setSourceLongitude(Double sourceLongitude) { this.sourceLongitude = sourceLongitude; }
    public Double getDestinationLatitude() { return destinationLatitude; }
    public void setDestinationLatitude(Double destinationLatitude) { this.destinationLatitude = destinationLatitude; }
    public Double getDestinationLongitude() { return destinationLongitude; }
    public void setDestinationLongitude(Double destinationLongitude) { this.destinationLongitude = destinationLongitude; }
    public Double getPackageWeight() { return packageWeight; }
    public void setPackageWeight(Double packageWeight) { this.packageWeight = packageWeight; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    public ShipmentStatus getShipmentStatus() { return shipmentStatus; }
    public void setShipmentStatus(ShipmentStatus shipmentStatus) { this.shipmentStatus = shipmentStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getEstimatedDeliveryAt() { return estimatedDeliveryAt; }
    public void setEstimatedDeliveryAt(LocalDateTime estimatedDeliveryAt) { this.estimatedDeliveryAt = estimatedDeliveryAt; }
    public Long getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(Long estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }
    public Long getDelayMinutes() { return delayMinutes; }
    public void setDelayMinutes(Long delayMinutes) { this.delayMinutes = delayMinutes; }
    public Boolean getReachedDestination() { return reachedDestination; }
    public void setReachedDestination(Boolean reachedDestination) { this.reachedDestination = reachedDestination; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public User getDriver() { return driver; }
    public void setDriver(User driver) { this.driver = driver; }
    public String getDeliveryFailureReason() { return deliveryFailureReason; }
    public void setDeliveryFailureReason(String deliveryFailureReason) { this.deliveryFailureReason = deliveryFailureReason; }
}
