package com.shiptrackpro.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "escalations")
public class Escalation {

    @Id
    @Column(length = 64)
    private String id;

    private String shipmentId;
    private String trackingNumber;
    private String customerName;
    private String businessClient;
    private String operatorName;
    private String supportAgentName;
    private String issueType;
    private String priority = "High";

    @Column(length = 2048)
    private String evidenceUrl;

    @Column(length = 2048)
    private String complaintDetails;

    @Column(length = 2048)
    private String agentDecision;

    private String escalationDate;
    private String status = "Open"; // Open, Under Review, Resolved

    @Column(length = 2048)
    private String internalNotes;

    public Escalation() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getShipmentId() { return shipmentId; }
    public void setShipmentId(String shipmentId) { this.shipmentId = shipmentId; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getBusinessClient() { return businessClient; }
    public void setBusinessClient(String businessClient) { this.businessClient = businessClient; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

    public String getSupportAgentName() { return supportAgentName; }
    public void setSupportAgentName(String supportAgentName) { this.supportAgentName = supportAgentName; }

    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getEvidenceUrl() { return evidenceUrl; }
    public void setEvidenceUrl(String evidenceUrl) { this.evidenceUrl = evidenceUrl; }

    public String getComplaintDetails() { return complaintDetails; }
    public void setComplaintDetails(String complaintDetails) { this.complaintDetails = complaintDetails; }

    public String getAgentDecision() { return agentDecision; }
    public void setAgentDecision(String agentDecision) { this.agentDecision = agentDecision; }

    public String getEscalationDate() { return escalationDate; }
    public void setEscalationDate(String escalationDate) { this.escalationDate = escalationDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getInternalNotes() { return internalNotes; }
    public void setInternalNotes(String internalNotes) { this.internalNotes = internalNotes; }
}
