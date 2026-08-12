package com.shiptrack.controller;

import com.shiptrack.dto.MonthlyShipmentTrendDTO;
import com.shiptrack.dto.CreateShipmentRequest;
import com.shiptrack.dto.DailyShipmentCountDTO;
import com.shiptrack.dto.TopCustomerDTO;
import com.shiptrack.dto.driver.DriverPerformanceResponse;
import com.shiptrack.entity.Shipment;
import com.shiptrack.service.ShipmentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(
            ShipmentService shipmentService) {

        this.shipmentService = shipmentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','BUSINESS')")
    public Shipment createShipment(
            @RequestBody CreateShipmentRequest request) {

        return shipmentService.createShipment(
                request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','BUSINESS','CUSTOMER','SUPPORT')")
    public List<Shipment> getAllShipments() {

        return shipmentService.getAllShipments();
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('CUSTOMER')")
    public List<Shipment> getMyShipments() {
        return shipmentService.getMyShipments();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','BUSINESS','CUSTOMER','SUPPORT')")
    public Shipment getShipmentById(
            @PathVariable Long id) {

        return shipmentService.getShipmentById(
                id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteShipment(
            @PathVariable Long id) {

        shipmentService.deleteShipment(id);

        return "Shipment deleted successfully";
    }

    @PostMapping("/fix-status-typos")
    @PreAuthorize("hasRole('ADMIN')")
    public String fixStatusTypos() {
        int updated = shipmentService.fixShipmentStatusTypos();
        return "Fixed " + updated + " shipment status record(s).";
    }

    @DeleteMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public String deleteAllShipments() {
        shipmentService.deleteAllShipments();
        return "All shipments deleted successfully.";
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public Shipment updateShipment(
            @PathVariable Long id,
            @RequestBody Shipment shipment) {

        return shipmentService.updateShipment(
                id,
                shipment);
    }

    @PutMapping("/{id}/driver")
    @PreAuthorize("hasRole('ADMIN')")
    public Shipment assignDriver(
            @PathVariable Long id,
            @RequestParam(required = false) Long driverId) {

        return shipmentService.assignDriver(
                id,
                driverId);
    }

    @GetMapping("/tracking/{trackingNumber}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','BUSINESS','CUSTOMER','SUPPORT','DRIVER')")
    public Shipment getShipmentByTrackingNumber(
            @PathVariable String trackingNumber) {

        return shipmentService
                .getShipmentByTrackingNumber(
                        trackingNumber);
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT')")
    public Map<String, Long> getShipmentAnalytics() {

        return Map.ofEntries(
                Map.entry("Created", shipmentService.getCreatedShipments()),

                Map.entry("Pending", shipmentService.getPendingShipments()),

                Map.entry("In Transit", shipmentService.getInTransitShipments()),

                Map.entry("Picked Up", shipmentService.getPickedUpShipments()),

                Map.entry("Active", shipmentService.getActiveShipments()),

                Map.entry("Active Drivers", shipmentService.getActiveDrivers()),

                Map.entry("Out For Delivery", shipmentService.getOutForDeliveryShipments()),

                Map.entry("Delivered", shipmentService.getDeliveredShipments()),

                Map.entry("Cancelled", shipmentService.getCancelledShipments()),

                Map.entry("Delivery Failed", shipmentService.getDeliveryFailedShipments()),

                Map.entry("Deliveries Today", shipmentService.getDeliveriesToday()),

                Map.entry("POD Generated Today", shipmentService.getPodsGeneratedToday()),

                Map.entry("Delivery Success Rate", shipmentService.getDeliverySuccessRate()),

                Map.entry("Delayed", shipmentService.getDelayedShipments()),

                Map.entry("Delay Percentage", shipmentService.getDelayPercentage()),

                Map.entry("Average Delivery Time", shipmentService.getAverageDeliveryTime()),

                Map.entry("Driver Performance", shipmentService.getDriverOnTimeRate()),

                Map.entry("Business Performance", shipmentService.getBusinessShipments()),

                Map.entry("Total", shipmentService.getTotalShipments())
        );
    }

    @GetMapping("/analytics/per-day")
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT')")
    public List<DailyShipmentCountDTO> getShipmentsPerDay(
            @RequestParam(defaultValue = "30") int days) {

        return shipmentService.getShipmentsPerDay(days);
    }

    @GetMapping("/analytics/deliveries-per-month")
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT')")
    public List<MonthlyShipmentTrendDTO> getDeliveriesPerMonth() {

        return shipmentService.getDeliveriesPerMonth();
    }

    @GetMapping("/analytics/top-drivers")
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT')")
    public List<DriverPerformanceResponse> getTopDrivers(
            @RequestParam(defaultValue = "5") int limit) {

        return shipmentService.getTopDrivers(limit);
    }

    @GetMapping("/analytics/top-customers")
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT')")
    public List<TopCustomerDTO> getTopCustomers(
            @RequestParam(defaultValue = "5") int limit) {

        return shipmentService.getTopCustomers(limit);
    }

    @GetMapping("/monthly-trend")
    @PreAuthorize("hasRole('ADMIN')")
    public List<MonthlyShipmentTrendDTO>
    getMonthlyTrend() {

        return shipmentService
                .getMonthlyShipmentTrend();
    }
}
