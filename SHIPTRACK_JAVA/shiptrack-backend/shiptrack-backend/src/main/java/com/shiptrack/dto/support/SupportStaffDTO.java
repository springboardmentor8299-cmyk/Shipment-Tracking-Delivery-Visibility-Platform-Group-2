package com.shiptrack.dto.support;

public class SupportStaffDTO {

    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private boolean active;
    private long totalAssignedTickets;
    private long openAssignedTickets;
    private long resolvedAssignedTickets;
    private double avgResolutionHours;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public long getTotalAssignedTickets() { return totalAssignedTickets; }
    public void setTotalAssignedTickets(long totalAssignedTickets) { this.totalAssignedTickets = totalAssignedTickets; }
    public long getOpenAssignedTickets() { return openAssignedTickets; }
    public void setOpenAssignedTickets(long openAssignedTickets) { this.openAssignedTickets = openAssignedTickets; }
    public long getResolvedAssignedTickets() { return resolvedAssignedTickets; }
    public void setResolvedAssignedTickets(long resolvedAssignedTickets) { this.resolvedAssignedTickets = resolvedAssignedTickets; }
    public double getAvgResolutionHours() { return avgResolutionHours; }
    public void setAvgResolutionHours(double avgResolutionHours) { this.avgResolutionHours = avgResolutionHours; }
}
