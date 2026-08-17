package com.shiptrackpro.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Table(name = "shipments", indexes = {
    @Index(name = "idx_shipment_tracking", columnList = "tracking_number", unique = true),
    @Index(name = "idx_shipment_status", columnList = "status"),
    @Index(name = "idx_shipment_created_user", columnList = "created_by_user")
})
public class Shipment {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "tracking_number", length = 64, nullable = false, unique = true)
    private String trackingNumber;

    @Column(length = 2048)
    private String pickupPhotoUrl;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "created_by_user")
    private String createdByUser;

    private String senderName;
    private String senderPhone;
    private String senderEmail;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "city", column = @Column(name = "sender_city")),
        @AttributeOverride(name = "state", column = @Column(name = "sender_state")),
        @AttributeOverride(name = "country", column = @Column(name = "sender_country")),
        @AttributeOverride(name = "lat", column = @Column(name = "sender_lat")),
        @AttributeOverride(name = "lng", column = @Column(name = "sender_lng")),
        @AttributeOverride(name = "address", column = @Column(name = "sender_address")),
        @AttributeOverride(name = "street", column = @Column(name = "sender_street")),
        @AttributeOverride(name = "zipCode", column = @Column(name = "sender_zip_code"))
    })
    private LocationPoint senderAddress;

    private String receiverName;
    private String receiverPhone;
    private String receiverEmail;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "city", column = @Column(name = "receiver_city")),
        @AttributeOverride(name = "state", column = @Column(name = "receiver_state")),
        @AttributeOverride(name = "country", column = @Column(name = "receiver_country")),
        @AttributeOverride(name = "lat", column = @Column(name = "receiver_lat")),
        @AttributeOverride(name = "lng", column = @Column(name = "receiver_lng")),
        @AttributeOverride(name = "address", column = @Column(name = "receiver_address")),
        @AttributeOverride(name = "street", column = @Column(name = "receiver_street")),
        @AttributeOverride(name = "zipCode", column = @Column(name = "receiver_zip_code"))
    })
    private LocationPoint receiverAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ShipmentStatus status = ShipmentStatus.CREATED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PriorityLevel priority = PriorityLevel.STANDARD;

    private Double weightKg = 1.0;
    private String packageType = "Parcel";
    private String dimensionsCm = "30x20x15";
    private Double declaredValueUsd = 100.0;

    @Column(length = 1024)
    private String contentsDescription;

    private Boolean isFragile = false;
    private Boolean isHazardous = false;

    @Column(length = 1024)
    private String specialHandlingNotes;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    @Column(name = "estimated_delivery_time")
    private String estimatedDeliveryTime;

    private String cancellationReason;
    private String cancelledAt;

    private String aiPredictedDelayRisk = "Low";

    @Column(length = 1024)
    private String aiDelayReason;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "city", column = @Column(name = "curr_city")),
        @AttributeOverride(name = "state", column = @Column(name = "curr_state")),
        @AttributeOverride(name = "country", column = @Column(name = "curr_country")),
        @AttributeOverride(name = "lat", column = @Column(name = "curr_lat")),
        @AttributeOverride(name = "lng", column = @Column(name = "curr_lng")),
        @AttributeOverride(name = "address", column = @Column(name = "curr_address")),
        @AttributeOverride(name = "street", column = @Column(name = "curr_street")),
        @AttributeOverride(name = "zipCode", column = @Column(name = "curr_zip_code"))
    })
    private LocationPoint currentLocation;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "driverId", column = @Column(name = "drv_id")),
        @AttributeOverride(name = "name", column = @Column(name = "drv_name")),
        @AttributeOverride(name = "phone", column = @Column(name = "drv_phone")),
        @AttributeOverride(name = "vehicle", column = @Column(name = "drv_vehicle")),
        @AttributeOverride(name = "licensePlate", column = @Column(name = "drv_plate")),
        @AttributeOverride(name = "rating", column = @Column(name = "drv_rating")),
        @AttributeOverride(name = "currentLat", column = @Column(name = "drv_lat")),
        @AttributeOverride(name = "currentLng", column = @Column(name = "drv_lng")),
        @AttributeOverride(name = "speedKmH", column = @Column(name = "drv_speed")),
        @AttributeOverride(name = "batteryPct", column = @Column(name = "drv_battery")),
        @AttributeOverride(name = "lastSignalTime", column = @Column(name = "drv_signal_time"))
    })
    private Driver driver;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "recipientName", column = @Column(name = "pod_recipient")),
        @AttributeOverride(name = "signeeName", column = @Column(name = "pod_signee")),
        @AttributeOverride(name = "signatureImageUrl", column = @Column(name = "pod_signature_url", length = 2048)),
        @AttributeOverride(name = "deliveryPhotoUrl", column = @Column(name = "pod_photo_url", length = 2048)),
        @AttributeOverride(name = "deliveredPackagePhotoUrl", column = @Column(name = "pod_doorstep_photo_url", length = 2048)),
        @AttributeOverride(name = "deliveredAt", column = @Column(name = "pod_delivered_at")),
        @AttributeOverride(name = "latitude", column = @Column(name = "pod_lat")),
        @AttributeOverride(name = "longitude", column = @Column(name = "pod_lng")),
        @AttributeOverride(name = "verificationCode", column = @Column(name = "pod_code")),
        @AttributeOverride(name = "verificationStatus", column = @Column(name = "pod_status")),
        @AttributeOverride(name = "verifiedByUserId", column = @Column(name = "pod_verified_by")),
        @AttributeOverride(name = "notes", column = @Column(name = "pod_notes", length = 1024))
    })
    private ProofOfDelivery proofOfDelivery;

    @Column(name = "route_path_json", columnDefinition = "TEXT")
    private String routePathJson;

    private Integer currentRouteIndex = 0;

    // @Column(length = 2048)
    // private String pickupPhotoUrl;

    private String failedReason;

    @Column(length = 1024)
    private String failedNotes;

    private Boolean sosAlertActive = false;
    private String sosAlertTimestamp;

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    private DispatchStatus dispatchStatus = DispatchStatus.UNASSIGNED;

    private String assignedOperatorId;
    private String assignedOperatorName;
    private String pickupWindow;
    private String dispatchDeclinedReason;
    private String dispatchAssignedAt;

    public Shipment() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTrackingNumber() { return trackingNumber; }
    public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getCreatedByUser() { return createdByUser; }
    public void setCreatedByUser(String createdByUser) { this.createdByUser = createdByUser; }

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

    public ShipmentStatus getStatus() { return status; }
    public void setStatus(ShipmentStatus status) { this.status = status; }

    public PriorityLevel getPriority() { return priority; }
    public void setPriority(PriorityLevel priority) { this.priority = priority; }

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

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getEstimatedDeliveryTime() { return estimatedDeliveryTime; }
    public void setEstimatedDeliveryTime(String estimatedDeliveryTime) { this.estimatedDeliveryTime = estimatedDeliveryTime; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public String getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(String cancelledAt) { this.cancelledAt = cancelledAt; }

    public String getAiPredictedDelayRisk() { return aiPredictedDelayRisk; }
    public void setAiPredictedDelayRisk(String aiPredictedDelayRisk) { this.aiPredictedDelayRisk = aiPredictedDelayRisk; }

    public String getAiDelayReason() { return aiDelayReason; }
    public void setAiDelayReason(String aiDelayReason) { this.aiDelayReason = aiDelayReason; }

    public LocationPoint getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(LocationPoint currentLocation) { this.currentLocation = currentLocation; }

    public Driver getDriver() { return driver; }
    public void setDriver(Driver driver) { this.driver = driver; }

    public ProofOfDelivery getProofOfDelivery() { return proofOfDelivery; }
    public void setProofOfDelivery(ProofOfDelivery proofOfDelivery) { this.proofOfDelivery = proofOfDelivery; }

    public String getRoutePathJson() { return routePathJson; }
    public void setRoutePathJson(String routePathJson) { this.routePathJson = routePathJson; }

    public Integer getCurrentRouteIndex() { return currentRouteIndex; }
    public void setCurrentRouteIndex(Integer currentRouteIndex) { this.currentRouteIndex = currentRouteIndex; }

    public String getPickupPhotoUrl() { return pickupPhotoUrl; }
    public void setPickupPhotoUrl(String pickupPhotoUrl) { this.pickupPhotoUrl = pickupPhotoUrl; }

    public String getFailedReason() { return failedReason; }
    public void setFailedReason(String failedReason) { this.failedReason = failedReason; }

    public String getFailedNotes() { return failedNotes; }
    public void setFailedNotes(String failedNotes) { this.failedNotes = failedNotes; }

    public Boolean getSosAlertActive() { return sosAlertActive; }
    public void setSosAlertActive(Boolean sosAlertActive) { this.sosAlertActive = sosAlertActive; }

    public String getSosAlertTimestamp() { return sosAlertTimestamp; }
    public void setSosAlertTimestamp(String sosAlertTimestamp) { this.sosAlertTimestamp = sosAlertTimestamp; }

    public DispatchStatus getDispatchStatus() { return dispatchStatus; }
    public void setDispatchStatus(DispatchStatus dispatchStatus) { this.dispatchStatus = dispatchStatus; }

    public String getAssignedOperatorId() { return assignedOperatorId; }
    public void setAssignedOperatorId(String assignedOperatorId) { this.assignedOperatorId = assignedOperatorId; }

    public String getAssignedOperatorName() { return assignedOperatorName; }
    public void setAssignedOperatorName(String assignedOperatorName) { this.assignedOperatorName = assignedOperatorName; }

    public String getPickupWindow() { return pickupWindow; }
    public void setPickupWindow(String pickupWindow) { this.pickupWindow = pickupWindow; }

    public String getDispatchDeclinedReason() { return dispatchDeclinedReason; }
    public void setDispatchDeclinedReason(String dispatchDeclinedReason) { this.dispatchDeclinedReason = dispatchDeclinedReason; }

    public String getDispatchAssignedAt() { return dispatchAssignedAt; }
    public void setDispatchAssignedAt(String dispatchAssignedAt) { this.dispatchAssignedAt = dispatchAssignedAt; }
}
