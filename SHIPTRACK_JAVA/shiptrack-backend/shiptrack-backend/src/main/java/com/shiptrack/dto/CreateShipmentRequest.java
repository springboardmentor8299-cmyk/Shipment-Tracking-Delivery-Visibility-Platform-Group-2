package com.shiptrack.dto;

import com.shiptrack.entity.ShipmentStatus;

public class CreateShipmentRequest {

    private String customerEmail;
    private String customerPhone;
    private String senderName;
    private String receiverName;
    private String sourceAddress;
    private String destinationAddress;
    private Double sourceLatitude;
    private Double sourceLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private Double packageWeight;
    private ShipmentStatus shipmentStatus;

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
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
    public ShipmentStatus getShipmentStatus() { return shipmentStatus; }
    public void setShipmentStatus(ShipmentStatus shipmentStatus) { this.shipmentStatus = shipmentStatus; }
}
