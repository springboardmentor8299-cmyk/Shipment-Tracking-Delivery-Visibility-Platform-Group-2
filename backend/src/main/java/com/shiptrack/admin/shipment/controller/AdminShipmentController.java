package com.shiptrack.admin.shipment.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shiptrack.admin.shipment.dto.LocationUpdateRequest;
import com.shiptrack.admin.shipment.dto.StatusUpdateRequest;
import com.shiptrack.admin.shipment.dto.TrackingResponseDto;
import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.service.ShipmentService;

@RestController
@RequestMapping("/api/shipments")
public class AdminShipmentController {

    private final ShipmentService shipmentService;

    public AdminShipmentController(ShipmentService shipmentService) {

        this.shipmentService = shipmentService;

    }

    @GetMapping
    public List<Shipment> getAllShipments() {

        return shipmentService.getAllShipments();

    }

    @PostMapping
    public Shipment addShipment(@RequestBody Shipment shipment) {

        return shipmentService.addShipment(shipment);

    }

    @PutMapping("/{id}")
    public Shipment updateShipment(

            @PathVariable Long id,

            @RequestBody Shipment shipment

    ) {

        return shipmentService.updateShipment(id, shipment);

    }

    @DeleteMapping("/{id}")
    public void deleteShipment(@PathVariable Long id) {
        shipmentService.deleteShipment(id);
    }


    // Live location ping endpoint (from driver app / IoT simulator)
  @PostMapping("/{trackingId}/location")
    public ResponseEntity<Shipment> updateLiveLocation(
            @PathVariable String trackingId,
            @RequestBody LocationUpdateRequest request) {

        System.out.println("Received trackingId = " + trackingId);

        return ResponseEntity.ok(
                shipmentService.updateLiveLocation(trackingId, request));
    }

    // Status management endpoint
    @PutMapping("/{trackingId}/status")
    public ResponseEntity<Shipment> updateStatus(
            @PathVariable String trackingId,
            @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(shipmentService.updateShipmentStatus(trackingId, request));
    }

    // Live tracking overview / predictions
    @GetMapping("/{trackingId}/tracking")
    public ResponseEntity<TrackingResponseDto> getTrackingDetails(@PathVariable String trackingId) {
        return ResponseEntity.ok(shipmentService.getTrackingDetails(trackingId));
    }

}