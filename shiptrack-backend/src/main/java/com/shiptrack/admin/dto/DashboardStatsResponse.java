package com.shiptrack.admin.dto;

public class DashboardStatsResponse {

    private long totalUsers;
    private long totalShipments;
    private long pending;
    private long pickedUp;
    private long inTransit;
    private long outForDelivery;
    private long delivered;
    private long cancelled;

    public DashboardStatsResponse() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalShipments() {
        return totalShipments;
    }

    public void setTotalShipments(long totalShipments) {
        this.totalShipments = totalShipments;
    }

    public long getPending() {
        return pending;
    }

    public void setPending(long pending) {
        this.pending = pending;
    }

    public long getPickedUp() {
        return pickedUp;
    }

    public void setPickedUp(long pickedUp) {
        this.pickedUp = pickedUp;
    }

    public long getInTransit() {
        return inTransit;
    }

    public void setInTransit(long inTransit) {
        this.inTransit = inTransit;
    }

    public long getOutForDelivery() {
        return outForDelivery;
    }

    public void setOutForDelivery(long outForDelivery) {
        this.outForDelivery = outForDelivery;
    }

    public long getDelivered() {
        return delivered;
    }

    public void setDelivered(long delivered) {
        this.delivered = delivered;
    }

    public long getCancelled() {
        return cancelled;
    }

    public void setCancelled(long cancelled) {
        this.cancelled = cancelled;
    }
}