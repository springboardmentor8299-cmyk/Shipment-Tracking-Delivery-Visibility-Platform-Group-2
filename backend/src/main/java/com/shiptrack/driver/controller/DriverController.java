package com.shiptrack.driver.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.shiptrack.admin.shipment.entity.Shipment;
import com.shiptrack.driver.dto.AssignShipmentRequest;
import com.shiptrack.driver.dto.DriverRequest;
import com.shiptrack.driver.dto.DriverResponse;
import com.shiptrack.driver.service.DriverService;

// Mapped under /api/operator, same base as OperatorController, which is
// already restricted to ROLE_LOGISTICS_OPERATOR in SecurityConfig.
@RestController
@RequestMapping("/api/operator")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @GetMapping("/drivers")
    public List<DriverResponse> getAllDrivers() {
        return driverService.getAllDrivers();
    }

    @PostMapping("/drivers")
    public DriverResponse createDriver(@RequestBody DriverRequest request) {
        return driverService.createDriver(request);
    }

    @PutMapping("/drivers/{id}")
    public DriverResponse updateDriver(
            @PathVariable Long id,
            @RequestBody DriverRequest request) {
        return driverService.updateDriver(id, request);
    }

    @DeleteMapping("/drivers/{id}")
    public void deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
    }

    @GetMapping("/shipments/unassigned")
    public List<Shipment> getUnassignedShipments() {
        return driverService.getUnassignedShipments();
    }

    @PutMapping("/shipments/{shipmentId}/assign-driver")
    public Shipment assignDriver(
            @PathVariable Long shipmentId,
            @RequestBody AssignShipmentRequest request) {
        return driverService.assignShipmentToDriver(shipmentId, request);
    }

    @PutMapping("/shipments/{shipmentId}/unassign-driver")
    public Shipment unassignDriver(@PathVariable Long shipmentId) {
        return driverService.unassignShipmentFromDriver(shipmentId);
    }
}
