package com.shiptrack.dto.support;

import java.util.List;
import java.util.Map;

public class SupportAnalyticsDTO {

    private Map<String, Long> statusBreakdown;
    private Map<String, Long> priorityBreakdown;
    private Map<String, Long> categoryBreakdown;
    private double avgResponseHours;
    private double avgResolutionHours;
    private long escalatedCount;
    private long complaintsCount;
    private List<SupportStaffDTO> staffPerformance;

    public Map<String, Long> getStatusBreakdown() { return statusBreakdown; }
    public void setStatusBreakdown(Map<String, Long> statusBreakdown) { this.statusBreakdown = statusBreakdown; }
    public Map<String, Long> getPriorityBreakdown() { return priorityBreakdown; }
    public void setPriorityBreakdown(Map<String, Long> priorityBreakdown) { this.priorityBreakdown = priorityBreakdown; }
    public Map<String, Long> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(Map<String, Long> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }
    public double getAvgResponseHours() { return avgResponseHours; }
    public void setAvgResponseHours(double avgResponseHours) { this.avgResponseHours = avgResponseHours; }
    public double getAvgResolutionHours() { return avgResolutionHours; }
    public void setAvgResolutionHours(double avgResolutionHours) { this.avgResolutionHours = avgResolutionHours; }
    public long getEscalatedCount() { return escalatedCount; }
    public void setEscalatedCount(long escalatedCount) { this.escalatedCount = escalatedCount; }
    public long getComplaintsCount() { return complaintsCount; }
    public void setComplaintsCount(long complaintsCount) { this.complaintsCount = complaintsCount; }
    public List<SupportStaffDTO> getStaffPerformance() { return staffPerformance; }
    public void setStaffPerformance(List<SupportStaffDTO> staffPerformance) { this.staffPerformance = staffPerformance; }
}
