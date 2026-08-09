package com.shiptrackpro.shiptrackpro.entity;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
@Entity
@Table(name = "shipments")
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
private String trackingId;

    @NotBlank(message = "Sender Name is required")
    private String senderName;

    @NotBlank(message = "Receiver Name is required")
    private String receiverName;

    @NotBlank(message = "Receiver Email is required")
    @Email(message = "Enter a valid email address")
    @Column(nullable = false)
    private String receiverEmail;

    @NotBlank(message = "Source is required")
    private String source;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "Current Location is required")
    private String currentLocation;
    private Double latitude;

    private Double longitude;

    private Integer etaHours;

    private boolean delivered = false;

    private String signature;
    @OneToMany(
        mappedBy="shipment",
        cascade=CascadeType.ALL
)
private List<RouteHistory> routeHistory;
    public Shipment() {
    }

    public Long getId() {
        return id;
    }

    public String getTrackingId() {
        return trackingId;
    }

    public void setTrackingId(String trackingId) {
        this.trackingId = trackingId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getReceiverEmail() {
        return receiverEmail;
    }

    public void setReceiverEmail(String receiverEmail) {
        this.receiverEmail = receiverEmail;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCurrentLocation() {
        return currentLocation;
    }

    public void setCurrentLocation(String currentLocation) {
        this.currentLocation = currentLocation;
    }


    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
    public Integer getEtaHours() {
        return etaHours;
    }
    
    public void setEtaHours(Integer etaHours) {
        this.etaHours = etaHours;
    }

    public boolean isDelivered() {
        return delivered;
    }
    
    public void setDelivered(boolean delivered) {
        this.delivered = delivered;
    }


    public String getSignature() {
        return signature;
    }
    
    public void setSignature(String signature) {
        this.signature = signature;
    }

    public List<RouteHistory> getRouteHistory() {
        return routeHistory;
    }
    
    
    public void setRouteHistory(List<RouteHistory> routeHistory) {
        this.routeHistory = routeHistory;
    }
}