package com.shiptrack.analytics.dto;

public class AnalyticsResponse {

    private long totalShipments;
    private long deliveredShipments;
    private long pendingShipments;
    private long inTransitShipments;
    private long failedDeliveries;

    private double deliverySuccessRate;

    public AnalyticsResponse() {
    }

    public long getTotalShipments() {
        return totalShipments;
    }

    public void setTotalShipments(long totalShipments) {
        this.totalShipments = totalShipments;
    }

    public long getDeliveredShipments() {
        return deliveredShipments;
    }

    public void setDeliveredShipments(long deliveredShipments) {
        this.deliveredShipments = deliveredShipments;
    }

    public long getPendingShipments() {
        return pendingShipments;
    }

    public void setPendingShipments(long pendingShipments) {
        this.pendingShipments = pendingShipments;
    }

    public long getInTransitShipments() {
        return inTransitShipments;
    }

    public void setInTransitShipments(long inTransitShipments) {
        this.inTransitShipments = inTransitShipments;
    }


    public long getFailedDeliveries() {
        return failedDeliveries;
    }

    public void setFailedDeliveries(long failedDeliveries) {
        this.failedDeliveries = failedDeliveries;
    }

    public double getDeliverySuccessRate() {
        return deliverySuccessRate;
    }

    public void setDeliverySuccessRate(double deliverySuccessRate) {
        this.deliverySuccessRate = deliverySuccessRate;
    }
}