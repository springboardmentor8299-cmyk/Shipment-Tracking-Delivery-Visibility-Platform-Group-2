package com.shiptrack.dto;

import java.time.LocalDateTime;

public class OperatorResponse {

    private Long id;
    private String operatorName;
    private String email;
    private String phone;
    private String licenseNumber;
    private String vehicleType;
    private String assignedRegion;
    private String address;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OperatorResponse() {
    }

    public OperatorResponse(Long id,
                            String operatorName,
                            String email,
                            String phone,
                            String licenseNumber,
                            String vehicleType,
                            String assignedRegion,
                            String address,
                            String city,
                            String state,
                            String country,
                            String postalCode,
                            Boolean isActive,
                            LocalDateTime createdAt,
                            LocalDateTime updatedAt) {
        this.id = id;
        this.operatorName = operatorName;
        this.email = email;
        this.phone = phone;
        this.licenseNumber = licenseNumber;
        this.vehicleType = vehicleType;
        this.assignedRegion = assignedRegion;
        this.address = address;
        this.city = city;
        this.state = state;
        this.country = country;
        this.postalCode = postalCode;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getAssignedRegion() {
        return assignedRegion;
    }

    public void setAssignedRegion(String assignedRegion) {
        this.assignedRegion = assignedRegion;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}