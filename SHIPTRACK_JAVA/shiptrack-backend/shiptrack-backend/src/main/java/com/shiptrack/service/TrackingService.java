package com.shiptrack.service;

import com.shiptrack.dto.tracking.*;

import java.util.List;

public interface TrackingService {

    DriverLocationResponse updateDriverLocation(DriverLocationRequest request);

    ShipmentLocationResponse getShipmentLocation(Long shipmentId);

    List<MapLocationResponse> getAllDriverLocations();
}
