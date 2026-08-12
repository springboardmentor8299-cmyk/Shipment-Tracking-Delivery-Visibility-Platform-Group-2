package com.shiptrack.controller;

import com.shiptrack.dto.DeliveryConfirmationRequest;
import com.shiptrack.dto.DeliveryConfirmationResponse;
import com.shiptrack.service.DeliveryConfirmationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-confirmations")
public class DeliveryConfirmationController {

    private final DeliveryConfirmationService deliveryConfirmationService;

    public DeliveryConfirmationController(DeliveryConfirmationService deliveryConfirmationService) {
        this.deliveryConfirmationService = deliveryConfirmationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('DRIVER')")
    public DeliveryConfirmationResponse confirmDelivery(
            @RequestBody DeliveryConfirmationRequest request) {

        return deliveryConfirmationService.confirmDelivery(request);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT','OPERATOR')")
    public List<DeliveryConfirmationResponse> getAllConfirmations() {

        return deliveryConfirmationService.getAllConfirmations();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT','OPERATOR','DRIVER','CUSTOMER')")
    public DeliveryConfirmationResponse getConfirmationById(
            @PathVariable Long id) {

        return deliveryConfirmationService.getConfirmationById(id);
    }

    @GetMapping("/shipment/{shipmentId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT','OPERATOR')")
    public List<DeliveryConfirmationResponse> getConfirmationsByShipment(
            @PathVariable Long shipmentId) {

        return deliveryConfirmationService.getConfirmationsByShipment(shipmentId);
    }

    @GetMapping("/my/driver")
    @PreAuthorize("hasRole('DRIVER')")
    public List<DeliveryConfirmationResponse> getMyDriverConfirmations() {

        return deliveryConfirmationService.getMyDriverConfirmations();
    }

    @GetMapping("/my/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<DeliveryConfirmationResponse> getMyCustomerConfirmations() {

        return deliveryConfirmationService.getMyCustomerConfirmations();
    }
}
