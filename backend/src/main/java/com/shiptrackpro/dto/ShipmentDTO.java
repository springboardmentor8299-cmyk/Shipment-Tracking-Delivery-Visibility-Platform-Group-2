package com.shiptrackpro.dto;

import com.shiptrackpro.entity.*;
import java.util.List;

public class ShipmentDTO {

    public static class CreateRequest {
        private String senderName;
        private String senderPhone;
        private String senderEmail;
        private LocationPoint senderAddress;
        private String receiverName;
        private String receiverPhone;
        private String receiverEmail;
        private LocationPoint receiverAddress;
        private String priority = "Standard";
        private Double weightKg = 1.0;
        private String packageType = "Standard Parcel";
        private String dimensionsCm = "30x20x15";
        private Double declaredValueUsd = 100.0;
        private String contentsDescription;
        private Boolean isFragile = false;
        private Boolean isHazardous = false;
        private String specialHandlingNotes;
        private String companyName;
        private String createdByUser;

        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }

        public String getSenderPhone() { return senderPhone; }
        public void setSenderPhone(String senderPhone) { this.senderPhone = senderPhone; }

        public String getSenderEmail() { return senderEmail; }
        public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

        public LocationPoint getSenderAddress() { return senderAddress; }
        public void setSenderAddress(LocationPoint senderAddress) { this.senderAddress = senderAddress; }

        public String getReceiverName() { return receiverName; }
        public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

        public String getReceiverPhone() { return receiverPhone; }
        public void setReceiverPhone(String receiverPhone) { this.receiverPhone = receiverPhone; }

        public String getReceiverEmail() { return receiverEmail; }
        public void setReceiverEmail(String receiverEmail) { this.receiverEmail = receiverEmail; }

        public LocationPoint getReceiverAddress() { return receiverAddress; }
        public void setReceiverAddress(LocationPoint receiverAddress) { this.receiverAddress = receiverAddress; }

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public Double getWeightKg() { return weightKg; }
        public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

        public String getPackageType() { return packageType; }
        public void setPackageType(String packageType) { this.packageType = packageType; }

        public String getDimensionsCm() { return dimensionsCm; }
        public void setDimensionsCm(String dimensionsCm) { this.dimensionsCm = dimensionsCm; }

        public Double getDeclaredValueUsd() { return declaredValueUsd; }
        public void setDeclaredValueUsd(Double declaredValueUsd) { this.declaredValueUsd = declaredValueUsd; }

        public String getContentsDescription() { return contentsDescription; }
        public void setContentsDescription(String contentsDescription) { this.contentsDescription = contentsDescription; }

        public Boolean getIsFragile() { return isFragile; }
        public void setIsFragile(Boolean fragile) { isFragile = fragile; }

        public Boolean getIsHazardous() { return isHazardous; }
        public void setIsHazardous(Boolean hazardous) { isHazardous = hazardous; }

        public String getSpecialHandlingNotes() { return specialHandlingNotes; }
        public void setSpecialHandlingNotes(String specialHandlingNotes) { this.specialHandlingNotes = specialHandlingNotes; }

        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }

        public String getCreatedByUser() { return createdByUser; }
        public void setCreatedByUser(String createdByUser) { this.createdByUser = createdByUser; }
    }

    public static class AssignOperatorRequest {
        private String operatorId;
        private String operatorName;
        private String pickupWindow;

        public String getOperatorId() { return operatorId; }
        public void setOperatorId(String operatorId) { this.operatorId = operatorId; }

        public String getOperatorName() { return operatorName; }
        public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

        public String getPickupWindow() { return pickupWindow; }
        public void setPickupWindow(String pickupWindow) { this.pickupWindow = pickupWindow; }
    }

    public static class DispatchResponseRequest {
        private String action; // "accept" or "decline"
        private String reason;

        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class StatusUpdateRequest {
        private String status;
        private String location;
        private String note;
        private String updatedBy;
        private String failedReason;
        private String failedNotes;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }

        public String getUpdatedBy() { return updatedBy; }
        public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }

        public String getFailedReason() { return failedReason; }
        public void setFailedReason(String failedReason) { this.failedReason = failedReason; }

        public String getFailedNotes() { return failedNotes; }
        public void setFailedNotes(String failedNotes) { this.failedNotes = failedNotes; }
    }

    public static class TelemetryUpdateRequest {
        private Double lat;
        private Double lng;
        private Double speedKmH;
        private Integer batteryPct;
        private String city;

        public Double getLat() { return lat; }
        public void setLat(Double lat) { this.lat = lat; }

        public Double getLng() { return lng; }
        public void setLng(Double lng) { this.lng = lng; }

        public Double getSpeedKmH() { return speedKmH; }
        public void setSpeedKmH(Double speedKmH) { this.speedKmH = speedKmH; }

        public Integer getBatteryPct() { return batteryPct; }
        public void setBatteryPct(Integer batteryPct) { this.batteryPct = batteryPct; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
    }

    public static class IssueReportRequest {
        private String issueType;
        private String notes;
        private String photoUrl;
        private String reportedBy;

        public String getIssueType() { return issueType; }
        public void setIssueType(String issueType) { this.issueType = issueType; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public String getPhotoUrl() { return photoUrl; }
        public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

        public String getReportedBy() { return reportedBy; }
        public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }
    }

    public static class ChatMessageRequest {
        private String text;
        private String senderName;
        private String senderRole;

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }

        public String getSenderRole() { return senderRole; }
        public void setSenderRole(String senderRole) { this.senderRole = senderRole; }
    }
}
