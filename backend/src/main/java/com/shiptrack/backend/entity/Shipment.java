package com.shiptrack.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "shipments")
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String trackingNumber;

    private String senderName;

    private String receiverName;

    private String pickupAddress;

    private String deliveryAddress;

    private String status;

    private Double weight;

    private Double price;

    // New Fields
    private String driverName;
private String driverEmail;
    private String vehicleNumber;

    private LocalDate estimatedDelivery;
private Double pickupLatitude;

private Double pickupLongitude;
    // Live Tracking
private Double currentLatitude;

private Double currentLongitude;

// Destination Coordinates
private Double destinationLatitude;

private Double destinationLongitude;

// Last Updated Time
private LocalDateTime lastLocationUpdate;

    public Shipment() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
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

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    // Driver Name

    public String getDriverName() {
        return driverName;
    }
public String getDriverEmail() {
    return driverEmail;
}

public void setDriverEmail(String driverEmail) {
    this.driverEmail = driverEmail;
}
    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    // Vehicle Number

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    // Estimated Delivery

    public LocalDate getEstimatedDelivery() {
        return estimatedDelivery;
    }

    public void setEstimatedDelivery(LocalDate estimatedDelivery) {
        this.estimatedDelivery = estimatedDelivery;
    }

    public Double getCurrentLatitude() {
    return currentLatitude;
}

public void setCurrentLatitude(Double currentLatitude) {
    this.currentLatitude = currentLatitude;
}

public Double getCurrentLongitude() {
    return currentLongitude;
}

public void setCurrentLongitude(Double currentLongitude) {
    this.currentLongitude = currentLongitude;
}

public Double getDestinationLatitude() {
    return destinationLatitude;
}

public void setDestinationLatitude(Double destinationLatitude) {
    this.destinationLatitude = destinationLatitude;
}

public Double getDestinationLongitude() {
    return destinationLongitude;
}

public void setDestinationLongitude(Double destinationLongitude) {
    this.destinationLongitude = destinationLongitude;
}

public LocalDateTime getLastLocationUpdate() {
    return lastLocationUpdate;
}

public void setLastLocationUpdate(LocalDateTime lastLocationUpdate) {
    this.lastLocationUpdate = lastLocationUpdate;
}
public Double getPickupLatitude() {
    return pickupLatitude;
}

public void setPickupLatitude(Double pickupLatitude) {
    this.pickupLatitude = pickupLatitude;
}

public Double getPickupLongitude() {
    return pickupLongitude;
}

public void setPickupLongitude(Double pickupLongitude) {
    this.pickupLongitude = pickupLongitude;
}
}