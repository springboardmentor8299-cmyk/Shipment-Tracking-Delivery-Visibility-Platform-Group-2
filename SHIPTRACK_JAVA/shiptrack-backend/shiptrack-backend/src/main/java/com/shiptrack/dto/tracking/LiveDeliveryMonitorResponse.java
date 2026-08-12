package com.shiptrack.dto.tracking;

public class LiveDeliveryMonitorResponse {

    private Long shipmentId;
    private String trackingNumber;
    private String shipmentStatus;
    private String driverName;
    private Double driverLatitude;
    private Double driverLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private String destinationAddress;
    private double distanceKm;
    private double estimatedSpeedKmh;
    private long etaMinutes;
    private String etaLabel;
    private boolean delayed;
    private String deliveryForecast;
    private String delayReason;
    private String googleMapsUrl;

    public Long getShipmentId() {
        return shipmentId;
    }

    public void setShipmentId(Long shipmentId) {
        this.shipmentId = shipmentId;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getShipmentStatus() {
        return shipmentStatus;
    }

    public void setShipmentStatus(String shipmentStatus) {
        this.shipmentStatus = shipmentStatus;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public Double getDriverLatitude() {
        return driverLatitude;
    }

    public void setDriverLatitude(Double driverLatitude) {
        this.driverLatitude = driverLatitude;
    }

    public Double getDriverLongitude() {
        return driverLongitude;
    }

    public void setDriverLongitude(Double driverLongitude) {
        this.driverLongitude = driverLongitude;
    }

    public Double getDestinationLatitude() {
        return destinationLatitude;
    }

    public void setDestinationLatitude(Double destinationLatitude) {
        this.destinationLatitude = destinationLatitude;
    }

    public Double getDestinationLongitude() {
        return destinationLongitude;
    }

    public void setDestinationLongitude(Double destinationLongitude) {
        this.destinationLongitude = destinationLongitude;
    }

    public String getDestinationAddress() {
        return destinationAddress;
    }

    public void setDestinationAddress(String destinationAddress) {
        this.destinationAddress = destinationAddress;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public double getEstimatedSpeedKmh() {
        return estimatedSpeedKmh;
    }

    public void setEstimatedSpeedKmh(double estimatedSpeedKmh) {
        this.estimatedSpeedKmh = estimatedSpeedKmh;
    }

    public long getEtaMinutes() {
        return etaMinutes;
    }

    public void setEtaMinutes(long etaMinutes) {
        this.etaMinutes = etaMinutes;
    }

    public String getEtaLabel() {
        return etaLabel;
    }

    public void setEtaLabel(String etaLabel) {
        this.etaLabel = etaLabel;
    }

    public boolean isDelayed() {
        return delayed;
    }

    public void setDelayed(boolean delayed) {
        this.delayed = delayed;
    }

    public String getDeliveryForecast() {
        return deliveryForecast;
    }

    public void setDeliveryForecast(String deliveryForecast) {
        this.deliveryForecast = deliveryForecast;
    }

    public String getDelayReason() {
        return delayReason;
    }

    public void setDelayReason(String delayReason) {
        this.delayReason = delayReason;
    }

    public String getGoogleMapsUrl() {
        return googleMapsUrl;
    }

    public void setGoogleMapsUrl(String googleMapsUrl) {
        this.googleMapsUrl = googleMapsUrl;
    }
}
