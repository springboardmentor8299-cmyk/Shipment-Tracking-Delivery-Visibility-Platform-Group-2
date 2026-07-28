package com.shiptrack.business_client.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.business_client.dto.BusinessDashboardResponse;
import com.shiptrack.business_client.service.BusinessService;

@RestController
@RequestMapping("/api/business")
public class BusinessController {

    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    // ==========================
    // Dashboard Statistics
    // ==========================

    @GetMapping("/dashboard")
    public BusinessDashboardResponse getDashboard() {
        return businessService.getDashboard();
    }

    // ==========================
    // Get All Business Shipments
    // ==========================

    @GetMapping("/shipments")
    public List<Shipment> getAllShipments() {
        return businessService.getAllShipments();
    }

    // ==========================
    // Update Shipment
    // ==========================

    @PutMapping("/shipments/{id}")
    public Shipment updateShipment(
            @PathVariable Long id,
            @RequestBody Shipment shipment) {

        return businessService.updateShipment(id, shipment);
    }

}