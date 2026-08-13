package com.shiptrack.customer.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shiptrack.admin.pod.dto.PodResponse;
import com.shiptrack.customer.dto.CustomerDashboardResponse;
import com.shiptrack.customer.dto.CustomerProfileResponse;
import com.shiptrack.customer.dto.CustomerShipmentResponse;
import com.shiptrack.customer.dto.ShipmentTrackingResponse;
import com.shiptrack.customer.service.CustomerService;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {

        private final CustomerService customerService;

        public CustomerController(CustomerService customerService) {
                this.customerService = customerService;
        }

        // Customer Dashboard
        @GetMapping("/dashboard")
        public CustomerDashboardResponse getDashboard(
                        Authentication authentication) {

                String username = authentication.getName();

                return customerService.getDashboard(username);
        }

        // Customer Shipments
        @GetMapping("/shipments")
        public List<CustomerShipmentResponse> getMyShipments(
                        Authentication authentication) {

                return customerService.getMyShipments(
                                authentication.getName());
        }

        // Shipment Tracking
        @GetMapping("/tracking/{trackingId}")
        public ShipmentTrackingResponse getTracking(

                        @PathVariable String trackingId,

                        Authentication authentication) {

                return customerService.getTracking(
                                authentication.getName(),
                                trackingId);
        }

        @GetMapping("/pod/{trackingId}")
        public PodResponse getBill(
                        @PathVariable String trackingId,
                        Authentication authentication) {

                return customerService.getBillForCustomer(
                                authentication.getName(),
                                trackingId);
        }

        // Customer Profile
        @GetMapping("/profile")
        public CustomerProfileResponse getProfile(
                        Authentication authentication) {

                return customerService.getProfile(
                                authentication.getName());
        }

        // Update Customer Phone Number
        @PutMapping("/profile/phone")
        public ResponseEntity<?> updatePhoneNumber(

                        @RequestBody java.util.Map<String, String> request,

                        Authentication authentication) {

                String phoneNumber = request.get("phoneNumber");

                if (phoneNumber == null ||
                                phoneNumber.trim().isEmpty()) {

                        return ResponseEntity
                                        .badRequest()
                                        .body("Phone number cannot be empty");
                }

                String updatedPhone = customerService.updatePhoneNumber(
                                authentication.getName(),
                                phoneNumber);

                return ResponseEntity.ok(
                                java.util.Map.of(
                                                "message",
                                                "Phone number updated successfully",
                                                "phoneNumber",
                                                updatedPhone));
        }
}