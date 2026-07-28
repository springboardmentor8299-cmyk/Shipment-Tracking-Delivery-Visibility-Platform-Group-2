package com.shiptrack.customer.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shiptrack.customer.dto.CustomerDashboardResponse;
import com.shiptrack.customer.dto.CustomerProfileResponse;
import com.shiptrack.customer.service.CustomerService;

import java.util.List;
import com.shiptrack.customer.dto.CustomerShipmentResponse;
import com.shiptrack.customer.dto.ShipmentTrackingResponse;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/dashboard")
    public CustomerDashboardResponse getDashboard(Authentication authentication) {

        String username = authentication.getName();

        return customerService.getDashboard(username);
    }

    @GetMapping("/shipments")
    public List<CustomerShipmentResponse> getMyShipments(Authentication authentication) {

        return customerService.getMyShipments(authentication.getName());
    }

    @GetMapping("/tracking/{trackingId}")
    public ShipmentTrackingResponse getTracking(

            @PathVariable String trackingId,

            Authentication authentication

    ) {

        return customerService.getTracking(

                authentication.getName(),

                trackingId

        );

    }

    @GetMapping("/profile")
    public CustomerProfileResponse getProfile(Authentication authentication) {

        return customerService.getProfile(authentication.getName());

    }
}