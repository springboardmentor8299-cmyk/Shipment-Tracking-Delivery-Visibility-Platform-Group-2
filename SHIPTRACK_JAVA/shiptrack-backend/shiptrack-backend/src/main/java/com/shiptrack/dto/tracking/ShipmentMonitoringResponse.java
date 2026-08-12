package com.shiptrack.dto.tracking;

import java.time.LocalDateTime;

public class ShipmentMonitoringResponse {

    private Long shipmentId;
    private String trackingNumber;
    private String senderName;
    private String receiverName;
    private String receiverAddress;
    private String sourceAddress;
    private String destinationAddress;
    private Double sourceLatitude;
    private Double sourceLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private Double currentLatitude;
    private Double currentLongitude;
    private Double distanceKm;
    private String shipmentStatus;
    private String createdBy;
    private Double packageWeight;
    private Long etaMinutes;
    private String etaLabel;
    private Long delayMinutes;
    private boolean reachedDestination;
    private double progressPercent;
    private String message;
    private String googleMapsUrl;
    private LocalDateTime deliveryTime;
    private String deliveryReceiverName;
    private String deliveryRemarks;
    private String deliveryDriverName;
    private String driverName;

    public LocalDateTime getDeliveryTime() { return deliveryTime; }
    public void setDeliveryTime(LocalDateTime deliveryTime) { this.deliveryTime = deliveryTime; }
    public String getDeliveryReceiverName() { return deliveryReceiverName; }
    public void setDeliveryReceiverName(String deliveryReceiverName) { this.deliveryReceiverName = deliveryReceiverName; }
    public String getDeliveryRemarks() { return deliveryRemarks; }
    public void setDeliveryRemarks(String deliveryRemarks) { this.deliveryRemarks = deliveryRemarks; }
    public String getDeliveryDriverName() { return deliveryDriverName; }
    public void setDeliveryDriverName(String deliveryDriverName) { this.deliveryDriverName = deliveryDriverName; }
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }

    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }
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
    public Double getCurrentLatitude() { return currentLatitude; }
    public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }
    public Double getCurrentLongitude() { return currentLongitude; }
    public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    public String getShipmentStatus() { return shipmentStatus; }
    public void setShipmentStatus(String shipmentStatus) { this.shipmentStatus = shipmentStatus; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public Double getPackageWeight() { return packageWeight; }
    public void setPackageWeight(Double packageWeight) { this.packageWeight = packageWeight; }
    public Long getEtaMinutes() { return etaMinutes; }
    public void setEtaMinutes(Long etaMinutes) { this.etaMinutes = etaMinutes; }
    public String getEtaLabel() { return etaLabel; }
    public void setEtaLabel(String etaLabel) { this.etaLabel = etaLabel; }
    public Long getDelayMinutes() { return delayMinutes; }
    public void setDelayMinutes(Long delayMinutes) { this.delayMinutes = delayMinutes; }
    public boolean isReachedDestination() { return reachedDestination; }
    public void setReachedDestination(boolean reachedDestination) { this.reachedDestination = reachedDestination; }
    public double getProgressPercent() { return progressPercent; }
    public void setProgressPercent(double progressPercent) { this.progressPercent = progressPercent; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getGoogleMapsUrl() { return googleMapsUrl; }
    public void setGoogleMapsUrl(String googleMapsUrl) { this.googleMapsUrl = googleMapsUrl; }
}
