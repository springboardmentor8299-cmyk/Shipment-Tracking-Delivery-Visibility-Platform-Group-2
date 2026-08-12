package com.shiptrack.dto;

import com.shiptrack.entity.DeliveryConfirmationStatus;

public class DeliveryConfirmationRequest {

    private Long shipmentId;

    private String receiverName;

    private DeliveryConfirmationStatus deliveryStatus;

    private String remarks;

    private String signatureData;

    private String deliveryPhoto;

    private Double latitude;

    private Double longitude;

    public Long getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(Long shipmentId) {
        this.shipmentId = shipmentId;
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
}
