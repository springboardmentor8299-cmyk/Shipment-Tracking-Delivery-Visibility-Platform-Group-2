package com.shiptrack.support_agent.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.support_agent.dto.SupportDashboardResponse;
import com.shiptrack.support_agent.service.SupportAgentService;

@RestController
@RequestMapping("/api/support")
public class SupportAgentController {

    private final SupportAgentService supportAgentService;

    public SupportAgentController(
            SupportAgentService supportAgentService) {

        this.supportAgentService = supportAgentService;
    }

    // ==========================
    // Dashboard Statistics
    // ==========================

    @GetMapping("/dashboard")
    public SupportDashboardResponse getDashboard() {

        return supportAgentService.getDashboard();

    }

    // ==========================
    // Get All Shipments
    // ==========================

    @GetMapping("/shipments")
    public List<Shipment> getAllShipments() {

        return supportAgentService.getAllShipments();

    }

    // ==========================
    // Update Shipment
    // ==========================

    @PutMapping("/shipments/{id}")
    public Shipment updateShipment(
            @PathVariable Long id,
            @RequestBody Shipment shipment) {

        return supportAgentService.updateShipment(id, shipment);

    }

}