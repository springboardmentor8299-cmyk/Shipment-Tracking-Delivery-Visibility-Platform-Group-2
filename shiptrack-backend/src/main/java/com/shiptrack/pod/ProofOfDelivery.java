package com.shiptrack.pod;

import com.shiptrack.shipment.Shipment;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "proof_of_delivery")
public class ProofOfDelivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "shipment_id", nullable = false, unique = true)
    private Shipment shipment;

    @Column(nullable = false)
    private String receiverName;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String signatureData;

    @Lob
    @Column(name = "delivery_photo", columnDefinition = "TEXT")
    private String deliveryPhoto;

    @Column(length = 500)
    private String deliveryNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus verificationStatus;

    private Double latitude;

    private Double longitude;

    private LocalDateTime deliveredAt;

    public ProofOfDelivery() {
    }

    @PrePersist
    public void prePersist() {
        if (verificationStatus == null) {
            verificationStatus = VerificationStatus.PENDING;
        }

        if (deliveredAt == null) {
            deliveredAt = LocalDateTime.now();
        }
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

    public String getDeliveryNotes() {
        return deliveryNotes;
    }

    public void setDeliveryNotes(String deliveryNotes) {
        this.deliveryNotes = deliveryNotes;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(
            VerificationStatus verificationStatus
    ) {
        this.verificationStatus = verificationStatus;
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

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }
}