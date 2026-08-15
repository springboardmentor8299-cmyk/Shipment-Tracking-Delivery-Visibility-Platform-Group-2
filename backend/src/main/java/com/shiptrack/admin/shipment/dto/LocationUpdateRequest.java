package com.shiptrack.admin.shipment.dto;

import lombok.Data;

@Data
public class LocationUpdateRequest {
    private Double currentLatitude;
    private Double currentLongitude;
    private Double truckSpeed; // km/h
    private String currentLocationName; // human-readable place name, e.g. "Satara"
}