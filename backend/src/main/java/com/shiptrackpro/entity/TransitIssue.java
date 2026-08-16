package com.shiptrackpro.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "transit_issues")
public class TransitIssue {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "shipment_id", length = 64, nullable = false)
    private String shipmentId;

    private String issueType;

    @Column(length = 2048)
    private String notes;

    @Column(length = 2048)
    private String photoUrl;

    private String reportedBy;
    private String timestamp;
    private String status = "Open"; // Open, Under Review, Resolved

    @Column(length = 2048)
    private String resolutionNotes;

    private String resolvedAt;
    private String resolvedBy;

    public TransitIssue() {}

    public TransitIssue(String id, String shipmentId, String issueType, String notes, String reportedBy, String timestamp) {
        this.id = id;
        this.shipmentId = shipmentId;
        this.issueType = issueType;
        this.notes = notes;
        this.reportedBy = reportedBy;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getShipmentId() { return shipmentId; }
    public void setShipmentId(String shipmentId) { this.shipmentId = shipmentId; }

    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public String getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(String resolvedAt) { this.resolvedAt = resolvedAt; }

    public String getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }
}
