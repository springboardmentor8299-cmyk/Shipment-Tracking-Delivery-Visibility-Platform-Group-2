package com.shiptrack.logistics_operator.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.admin.shipment.service.ShipmentService;
import com.shiptrack.logistics_operator.dto.OperatorDashboardResponse;
import com.shiptrack.logistics_operator.service.OperatorService;

@RestController
@RequestMapping("/api/operator")
public class OperatorController {

    private final OperatorService operatorService;
    private final ShipmentService shipmentService;

    public OperatorController(
            OperatorService operatorService,
            ShipmentService shipmentService) {

        this.operatorService = operatorService;
        this.shipmentService = shipmentService;
    }

    @GetMapping("/dashboard")
    public OperatorDashboardResponse getDashboard() {
        return operatorService.getDashboard();
    }

    @GetMapping("/shipments")
    public List<Shipment> getShipments() {
        return shipmentService.getAllShipments();
    }

    @PutMapping("/shipments/{id}")
    public Shipment updateShipment(
            @PathVariable Long id,
            @RequestBody Shipment shipment) {

        return shipmentService.updateShipment(id, shipment);
    }

}