package com.shiptrack.shipment;

import com.shiptrack.shipment.dto.ShipmentRequest;
import com.shiptrack.shipment.dto.ShipmentResponse;
import com.shiptrack.shipment.dto.UpdateStatusRequest;
import com.shiptrack.shipment.dto.ShipmentUpdateRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.shiptrack.tracking.TrackingService;
import com.shiptrack.tracking.dto.TrackingEventResponse;
import com.shiptrack.dto.LocationUpdateRequest;

import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@CrossOrigin(origins = "http://localhost:5173")
public class ShipmentController {

    private final ShipmentService shipmentService;
    private final TrackingService trackingService;

    public ShipmentController(
            ShipmentService shipmentService,
            TrackingService trackingService) {

        this.shipmentService = shipmentService;
        this.trackingService = trackingService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER','BUSINESS_CLIENT')")
    public ResponseEntity<ShipmentResponse> createShipment(
            @RequestBody ShipmentRequest request) {

        return ResponseEntity.ok(
                shipmentService.createShipment(request)
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','LOGISTICS_OPERATOR')")
    public ResponseEntity<List<ShipmentResponse>> getAllShipments() {

        return ResponseEntity.ok(
                shipmentService.getAllShipments()
        );
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('CUSTOMER','BUSINESS_CLIENT')")
    public ResponseEntity<List<ShipmentResponse>> getMyShipments() {

        return ResponseEntity.ok(
                shipmentService.getMyShipments()
        );
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('CUSTOMER','BUSINESS_CLIENT')")
    public ResponseEntity<List<ShipmentResponse>> getDeliveryHistory() {

        return ResponseEntity.ok(
                shipmentService.getDeliveryHistory()
        );
    }
    @GetMapping("/id/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','LOGISTICS_OPERATOR')")
    public ResponseEntity<ShipmentResponse> getShipmentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                shipmentService.getShipmentById(id)
        );
    }

    @GetMapping("/{trackingNumber}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ShipmentResponse> getShipment(
            @PathVariable String trackingNumber) {

        return ResponseEntity.ok(
                shipmentService.getShipmentByTrackingNumber(trackingNumber)
        );
    }

    @PutMapping("/{trackingNumber}/status")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','LOGISTICS_OPERATOR')")
    public ResponseEntity<ShipmentResponse> updateStatus(
            @PathVariable String trackingNumber,
            @RequestBody UpdateStatusRequest request) {

        return ResponseEntity.ok(
                shipmentService.updateShipmentStatus(
                        trackingNumber,
                        request.getStatus()
                )
        );
    }
    @GetMapping("/{trackingNumber}/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TrackingEventResponse>> getTrackingHistory(
            @PathVariable String trackingNumber) {

        Shipment shipment = shipmentService.findShipment(trackingNumber);

        return ResponseEntity.ok(
                trackingService.getTrackingHistory(shipment)
        );
    }

    @PutMapping("/{trackingNumber}/location")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','LOGISTICS_OPERATOR')")
    public ResponseEntity<ShipmentResponse> updateLocation(
            @PathVariable String trackingNumber,
            @RequestBody LocationUpdateRequest request
    ) {

        return ResponseEntity.ok(
                shipmentService.updateLocation(
                        trackingNumber,
                        request
                )
        );
    }

    @PutMapping("/{trackingNumber}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','LOGISTICS_OPERATOR')")
    public ResponseEntity<ShipmentResponse> updateShipment(
            @PathVariable String trackingNumber,
            @RequestBody ShipmentUpdateRequest request) {

        return ResponseEntity.ok(
                shipmentService.updateShipment(
                        trackingNumber,
                        request
                )
        );
    }
}