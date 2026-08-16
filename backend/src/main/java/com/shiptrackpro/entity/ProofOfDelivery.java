package com.shiptrackpro.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ProofOfDelivery {

    private String recipientName;
    private String signeeName;

    @Column(length = 2048)
    private String signatureImageUrl;

    @Column(length = 2048)
    private String deliveryPhotoUrl;

    @Column(length = 2048)
    private String deliveredPackagePhotoUrl;

    // @Column(length = 2048)
    // private String pickupPhotoUrl;

    private String deliveredAt;
    private Double latitude;
    private Double longitude;
    private String verificationCode;
    private String verificationStatus = "VERIFIED"; // PENDING, VERIFIED, FLAGGED
    private String verifiedByUserId;

    @Column(length = 1024)
    private String notes;

    public ProofOfDelivery() {}

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getSigneeName() { return signeeName; }
    public void setSigneeName(String signeeName) { this.signeeName = signeeName; }

    public String getSignatureImageUrl() { return signatureImageUrl; }
    public void setSignatureImageUrl(String signatureImageUrl) { this.signatureImageUrl = signatureImageUrl; }

    public String getDeliveryPhotoUrl() { return deliveryPhotoUrl; }
    public void setDeliveryPhotoUrl(String deliveryPhotoUrl) { this.deliveryPhotoUrl = deliveryPhotoUrl; }

    public String getDeliveredPackagePhotoUrl() { return deliveredPackagePhotoUrl; }
    public void setDeliveredPackagePhotoUrl(String deliveredPackagePhotoUrl) { this.deliveredPackagePhotoUrl = deliveredPackagePhotoUrl; }

    // public String getPickupPhotoUrl() { return pickupPhotoUrl; }
    // public void setPickupPhotoUrl(String pickupPhotoUrl) { this.pickupPhotoUrl = pickupPhotoUrl; }

    public String getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(String deliveredAt) { this.deliveredAt = deliveredAt; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getVerificationCode() { return verificationCode; }
    public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getVerifiedByUserId() { return verifiedByUserId; }
    public void setVerifiedByUserId(String verifiedByUserId) { this.verifiedByUserId = verifiedByUserId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
