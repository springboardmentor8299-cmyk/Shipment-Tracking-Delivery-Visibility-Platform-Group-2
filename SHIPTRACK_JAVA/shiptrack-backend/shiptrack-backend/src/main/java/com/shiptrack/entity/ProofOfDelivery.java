package com.shiptrack.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "proof_of_delivery")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProofOfDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false, unique = true)
    private Shipment shipment;

    @Column(nullable = false, length = 200)
    private String receiverName;

    @Column(nullable = false)
    private LocalDateTime deliveryTime;

    @Column(length = 200)
    private String driverName;

    private Double latitude;

    private Double longitude;

    @Column(columnDefinition = "TEXT")
    private String signatureData;

    @Column(columnDefinition = "TEXT")
    private String deliveryPhoto;

    @Column(length = 2000)
    private String remarks;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ProofOfDelivery() {
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

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public LocalDateTime getDeliveryTime() {
        return deliveryTime;
    }

    public void setDeliveryTime(LocalDateTime deliveryTime) {
        this.deliveryTime = deliveryTime;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
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

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
