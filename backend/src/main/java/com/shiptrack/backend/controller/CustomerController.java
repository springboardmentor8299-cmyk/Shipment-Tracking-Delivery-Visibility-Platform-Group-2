package com.shiptrack.backend.controller;

import com.shiptrack.backend.entity.Shipment;
import com.shiptrack.backend.service.ShipmentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = "http://localhost:3000")
public class CustomerController {

    private final ShipmentService shipmentService;

    public CustomerController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/shipments/{customerName}")
    public List<Shipment> getCustomerShipments(
            @PathVariable String customerName) {

        return shipmentService.getShipmentsByCustomer(customerName);
    }
}