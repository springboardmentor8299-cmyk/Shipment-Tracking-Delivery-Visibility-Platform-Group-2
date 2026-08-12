package com.shiptrack.dto;

public class OperatorStatsResponse {

    private long totalOperators;
    private long activeOperators;
    private long inactiveOperators;

    public OperatorStatsResponse() {
    }

    public OperatorStatsResponse(long totalOperators, long activeOperators, long inactiveOperators) {
        this.totalOperators = totalOperators;
        this.activeOperators = activeOperators;
        this.inactiveOperators = inactiveOperators;
    }

    public long getTotalOperators() {
        return totalOperators;
    }

    public void setTotalOperators(long totalOperators) {
        this.totalOperators = totalOperators;
    }

    public long getActiveOperators() {
        return activeOperators;
    }

    public void setActiveOperators(long activeOperators) {
        this.activeOperators = activeOperators;
    }

    public long getInactiveOperators() {
        return inactiveOperators;
    }

    public void setInactiveOperators(long inactiveOperators) {
        this.inactiveOperators = inactiveOperators;
    }
}