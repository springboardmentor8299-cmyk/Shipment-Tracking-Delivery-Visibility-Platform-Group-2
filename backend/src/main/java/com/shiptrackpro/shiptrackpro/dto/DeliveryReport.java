package com.shiptrackpro.shiptrackpro.dto;

public class DeliveryReport {


    private long totalShipments;

    private long deliveredShipments;

    private long pendingShipments;

    private long inTransitShipments;

    private double deliverySuccessRate;




    public DeliveryReport() {

    }


    public DeliveryReport(
            long totalShipments,
            long deliveredShipments,
            long pendingShipments,
            long inTransitShipments,
            double deliverySuccessRate
    ) {

        this.totalShipments = totalShipments;
        this.deliveredShipments = deliveredShipments;
        this.pendingShipments = pendingShipments;
        this.inTransitShipments = inTransitShipments;
        this.deliverySuccessRate = deliverySuccessRate;

    }



    public long getTotalShipments() {
        return totalShipments;
    }


    public long getDeliveredShipments() {
        return deliveredShipments;
    }


    public long getPendingShipments() {
        return pendingShipments;
    }


    public long getInTransitShipments() {
        return inTransitShipments;
    }


    public double getDeliverySuccessRate() {
        return deliverySuccessRate;
    }

}