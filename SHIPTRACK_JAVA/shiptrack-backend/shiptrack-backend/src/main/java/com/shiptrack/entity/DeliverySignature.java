package com.shiptrack.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_signatures")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DeliverySignature {

    public enum ValidationStatus {
        PENDING,
        VALIDATED,
        REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String signatureData;

    @Column(nullable = false)
    private String contentType = "image/png";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ValidationStatus validationStatus = ValidationStatus.PENDING;

    @Column(length = 500)
    private String validationMessage;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public DeliverySignature() {
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

    public String getSignatureData() {
        return signatureData;
    }

    public void setSignatureData(String signatureData) {
        this.signatureData = signatureData;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public ValidationStatus getValidationStatus() {
        return validationStatus;
    }

    public void setValidationStatus(ValidationStatus validationStatus) {
        this.validationStatus = validationStatus;
    }

    public String getValidationMessage() {
        return validationMessage;
    }

    public void setValidationMessage(String validationMessage) {
        this.validationMessage = validationMessage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
