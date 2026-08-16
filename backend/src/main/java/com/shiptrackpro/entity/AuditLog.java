package com.shiptrackpro.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String timestamp;

    @Column(nullable = false)
    private String adminUser;

    @Column(nullable = false)
    private String actionType;

    private String targetEntity;

    @Column(length = 2048)
    private String details;

    private String severity = "Medium"; // Low, Medium, High, Critical
    private String ipAddress = "127.0.0.1";

    public AuditLog() {}

    public AuditLog(String id, String timestamp, String adminUser, String actionType, String targetEntity, String details, String severity, String ipAddress) {
        this.id = id;
        this.timestamp = timestamp;
        this.adminUser = adminUser;
        this.actionType = actionType;
        this.targetEntity = targetEntity;
        this.details = details;
        this.severity = severity;
        this.ipAddress = ipAddress;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getAdminUser() { return adminUser; }
    public void setAdminUser(String adminUser) { this.adminUser = adminUser; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getTargetEntity() { return targetEntity; }
    public void setTargetEntity(String targetEntity) { this.targetEntity = targetEntity; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}
