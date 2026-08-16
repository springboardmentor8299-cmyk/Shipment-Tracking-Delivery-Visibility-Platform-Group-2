package com.shiptrackpro.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class Driver {

    private String driverId;
    private String name;
    private String phone;
    private String vehicle;
    private String licensePlate;
    private Double rating = 4.8;
    private Double currentLat;
    private Double currentLng;
    private Double speedKmH = 65.0;
    private Integer batteryPct = 88;
    private String lastSignalTime;

    public Driver() {}

    public Driver(String driverId, String name, String phone, String vehicle, String licensePlate) {
        this.driverId = driverId;
        this.name = name;
        this.phone = phone;
        this.vehicle = vehicle;
        this.licensePlate = licensePlate;
    }

    public String getDriverId() { return driverId; }
    public void setDriverId(String driverId) { this.driverId = driverId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getVehicle() { return vehicle; }
    public void setVehicle(String vehicle) { this.vehicle = vehicle; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Double getCurrentLat() { return currentLat; }
    public void setCurrentLat(Double currentLat) { this.currentLat = currentLat; }

    public Double getCurrentLng() { return currentLng; }
    public void setCurrentLng(Double currentLng) { this.currentLng = currentLng; }

    public Double getSpeedKmH() { return speedKmH; }
    public void setSpeedKmH(Double speedKmH) { this.speedKmH = speedKmH; }

    public Integer getBatteryPct() { return batteryPct; }
    public void setBatteryPct(Integer batteryPct) { this.batteryPct = batteryPct; }

    public String getLastSignalTime() { return lastSignalTime; }
    public void setLastSignalTime(String lastSignalTime) { this.lastSignalTime = lastSignalTime; }
}
