package com.shiptrack.backend.controller;

import com.shiptrack.backend.dto.LocationUpdateRequest;
import com.shiptrack.backend.entity.Shipment;
import com.shiptrack.backend.service.ShipmentService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.security.core.Authentication;
@RestController
@RequestMapping("/api/shipments")
@CrossOrigin(origins = "http://localhost:3000")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    // ================= CREATE SHIPMENT =================

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Shipment createShipment(@RequestBody Shipment shipment) {

        return shipmentService.createShipment(shipment);

    }

    // ================= GET ALL SHIPMENTS =================

    @PreAuthorize("hasAnyRole('ADMIN','CUSTOMER')")
    @GetMapping
public List<Shipment> getAllShipments() {

    List<Shipment> shipments = shipmentService.getAllShipments();

    System.out.println("Total Shipments = " + shipments.size());

    return shipments;

}

    // ================= GET SHIPMENT BY ID =================

    @PreAuthorize("hasAnyRole('ADMIN','CUSTOMER','DRIVER')")
    @GetMapping("/{id}")
    public Shipment getShipmentById(@PathVariable Long id) {

        return shipmentService.getShipmentById(id);

    }

    // ================= DRIVER SHIPMENTS =================

    @PreAuthorize("hasRole('DRIVER')")
@GetMapping("/driver")
public List<Shipment> getDriverShipments(Authentication authentication) {

    String driverEmail = authentication.getName();

    return shipmentService.getShipmentsByDriver(driverEmail);

}

    // ================= UPDATE SHIPMENT =================

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Shipment updateShipment(
            @PathVariable Long id,
            @RequestBody Shipment shipment) {

        return shipmentService.updateShipment(id, shipment);

    }

    // ================= DELETE SHIPMENT =================

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteShipment(@PathVariable Long id) {

        shipmentService.deleteShipment(id);

    }

    // ================= UPDATE LIVE LOCATION =================

    @PreAuthorize("hasAnyRole('ADMIN','DRIVER')")
    @PutMapping("/{id}/location")
    public Shipment updateLocation(
            @PathVariable Long id,
            @RequestBody LocationUpdateRequest request) {

        return shipmentService.updateLocation(
                id,
                request.getLatitude(),
                request.getLongitude()
        );

    }

}