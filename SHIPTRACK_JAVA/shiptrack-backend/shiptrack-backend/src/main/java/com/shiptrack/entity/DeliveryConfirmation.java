package com.shiptrack.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_confirmations")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DeliveryConfirmation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    @Column(nullable = false)
    private LocalDateTime deliveryTime;

    @Column(nullable = false, length = 200)
    private String receiverName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryConfirmationStatus deliveryStatus = DeliveryConfirmationStatus.CONFIRMED;

    @Column(length = 2000)
    private String remarks;

    @Column(columnDefinition = "TEXT")
    private String signatureData;

    @Column(columnDefinition = "TEXT")
    private String deliveryPhoto;

    private Double deliveryLatitude;

    private Double deliveryLongitude;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public DeliveryConfirmation() {
    }

    public Long getId() {
        return id;
    }

    public Shipment getShipment() {
        return shipment;
    }

    public void setShipment(Shipment shipment) {
        this.shipment = shipment;
    }

    public User getDriver() {
        return driver;
    }

    public void setDriver(User driver) {
        this.driver = driver;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public LocalDateTime getDeliveryTime() {
        return deliveryTime;
    }

    public void setDeliveryTime(LocalDateTime deliveryTime) {
        this.deliveryTime = deliveryTime;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public DeliveryConfirmationStatus getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(DeliveryConfirmationStatus deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getSignatureData() {
        return signatureData;
    }

    public void setSignatureData(String signatureData) {
        this.signatureData = signatureData;
    }

    public String getDeliveryPhoto() {
        return deliveryPhoto;
    }

    public void setDeliveryPhoto(String deliveryPhoto) {
        this.deliveryPhoto = deliveryPhoto;
    }

    public Double getDeliveryLatitude() {
        return deliveryLatitude;
    }

    public void setDeliveryLatitude(Double deliveryLatitude) {
        this.deliveryLatitude = deliveryLatitude;
    }

    public Double getDeliveryLongitude() {
        return deliveryLongitude;
    }

    public void setDeliveryLongitude(Double deliveryLongitude) {
        this.deliveryLongitude = deliveryLongitude;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
