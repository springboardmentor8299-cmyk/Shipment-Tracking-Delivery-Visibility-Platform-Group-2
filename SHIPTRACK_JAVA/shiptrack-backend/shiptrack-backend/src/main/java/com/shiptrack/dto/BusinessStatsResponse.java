package com.shiptrack.dto;

public class BusinessStatsResponse {

    private long totalBusinesses;

    private long activeBusinesses;

    private long inactiveBusinesses;

    public BusinessStatsResponse() {
    }

    public BusinessStatsResponse(long totalBusinesses,
                                 long activeBusinesses,
                                 long inactiveBusinesses) {
        this.totalBusinesses = totalBusinesses;
        this.activeBusinesses = activeBusinesses;
        this.inactiveBusinesses = inactiveBusinesses;
    }

    public long getTotalBusinesses() {
        return totalBusinesses;
    }

    public void setTotalBusinesses(long totalBusinesses) {
        this.totalBusinesses = totalBusinesses;
    }

    public long getActiveBusinesses() {
        return activeBusinesses;
    }

    public void setActiveBusinesses(long activeBusinesses) {
        this.activeBusinesses = activeBusinesses;
    }

    public long getInactiveBusinesses() {
        return inactiveBusinesses;
    }

    public void setInactiveBusinesses(long inactiveBusinesses) {
        this.inactiveBusinesses = inactiveBusinesses;
    }
}
