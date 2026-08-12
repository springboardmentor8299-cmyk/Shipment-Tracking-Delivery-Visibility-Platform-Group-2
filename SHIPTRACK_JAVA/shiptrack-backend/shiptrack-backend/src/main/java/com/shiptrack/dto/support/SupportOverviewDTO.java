package com.shiptrack.dto.support;

public class SupportOverviewDTO {

    private long totalTickets;
    private long openTickets;
    private long inProgressTickets;
    private long resolvedTickets;
    private long closedTickets;
    private long escalatedTickets;
    private long complaints;
    private long unassignedTickets;
    private long overdueTickets;
    private long highPriorityOpen;
    private long supportStaffCount;
    private double avgResponseHours;
    private double avgResolutionHours;

    public long getTotalTickets() { return totalTickets; }
    public void setTotalTickets(long totalTickets) { this.totalTickets = totalTickets; }
    public long getOpenTickets() { return openTickets; }
    public void setOpenTickets(long openTickets) { this.openTickets = openTickets; }
    public long getInProgressTickets() { return inProgressTickets; }
    public void setInProgressTickets(long inProgressTickets) { this.inProgressTickets = inProgressTickets; }
    public long getResolvedTickets() { return resolvedTickets; }
    public void setResolvedTickets(long resolvedTickets) { this.resolvedTickets = resolvedTickets; }
    public long getClosedTickets() { return closedTickets; }
    public void setClosedTickets(long closedTickets) { this.closedTickets = closedTickets; }
    public long getEscalatedTickets() { return escalatedTickets; }
    public void setEscalatedTickets(long escalatedTickets) { this.escalatedTickets = escalatedTickets; }
    public long getComplaints() { return complaints; }
    public void setComplaints(long complaints) { this.complaints = complaints; }
    public long getUnassignedTickets() { return unassignedTickets; }
    public void setUnassignedTickets(long unassignedTickets) { this.unassignedTickets = unassignedTickets; }
    public long getOverdueTickets() { return overdueTickets; }
    public void setOverdueTickets(long overdueTickets) { this.overdueTickets = overdueTickets; }
    public long getHighPriorityOpen() { return highPriorityOpen; }
    public void setHighPriorityOpen(long highPriorityOpen) { this.highPriorityOpen = highPriorityOpen; }
    public long getSupportStaffCount() { return supportStaffCount; }
    public void setSupportStaffCount(long supportStaffCount) { this.supportStaffCount = supportStaffCount; }
    public double getAvgResponseHours() { return avgResponseHours; }
    public void setAvgResponseHours(double avgResponseHours) { this.avgResponseHours = avgResponseHours; }
    public double getAvgResolutionHours() { return avgResolutionHours; }
    public void setAvgResolutionHours(double avgResolutionHours) { this.avgResolutionHours = avgResolutionHours; }
}
