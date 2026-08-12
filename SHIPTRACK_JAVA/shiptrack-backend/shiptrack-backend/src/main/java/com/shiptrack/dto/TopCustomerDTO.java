package com.shiptrack.dto;

public class TopCustomerDTO {

    private String customerName;
    private long totalShipments;
    private long deliveredShipments;
    private long cancelledShipments;

    public TopCustomerDTO() {
    }

    public TopCustomerDTO(
            String customerName,
            long totalShipments,
            long deliveredShipments,
            long cancelledShipments) {

        this.customerName = customerName;
        this.totalShipments = totalShipments;
        this.deliveredShipments = deliveredShipments;
        this.cancelledShipments = cancelledShipments;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
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

    public long getCancelledShipments() {
        return cancelledShipments;
    }

    public void setCancelledShipments(long cancelledShipments) {
        this.cancelledShipments = cancelledShipments;
    }
}
