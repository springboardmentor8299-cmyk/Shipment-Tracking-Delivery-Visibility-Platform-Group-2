package com.shiptrack.controller;

import com.shiptrack.dto.tracking.DriverLocationRequest;
import com.shiptrack.dto.tracking.DriverLocationResponse;
import com.shiptrack.dto.tracking.LiveDeliveryMonitorResponse;
import com.shiptrack.dto.tracking.MapLocationResponse;
import com.shiptrack.dto.tracking.ShipmentLocationResponse;
import com.shiptrack.service.DeliveryMonitoringService;
import com.shiptrack.service.TrackingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracking")
public class TrackingController {

    private final TrackingService trackingService;
    private final DeliveryMonitoringService deliveryMonitoringService;

    public TrackingController(TrackingService trackingService,
                              DeliveryMonitoringService deliveryMonitoringService) {
        this.trackingService = trackingService;
        this.deliveryMonitoringService = deliveryMonitoringService;
    }

    @PutMapping("/location")
    public DriverLocationResponse updateDriverLocation(

            @RequestBody DriverLocationRequest request) {
        return trackingService.updateDriverLocation(request);
    }

    @GetMapping("/shipment/{shipmentId}")
    public ShipmentLocationResponse getShipmentLocation(@PathVariable Long shipmentId) {
        return trackingService.getShipmentLocation(shipmentId);
    }

    @GetMapping("/drivers")
    public List<MapLocationResponse> getAllDriverLocations() {
        return trackingService.getAllDriverLocations();
    }

    @GetMapping("/monitor/{shipmentId}")
    public LiveDeliveryMonitorResponse getLiveDeliveryMonitor(@PathVariable Long shipmentId) {
        return deliveryMonitoringService.getLiveDeliveryMonitoring(shipmentId);
    }
}
