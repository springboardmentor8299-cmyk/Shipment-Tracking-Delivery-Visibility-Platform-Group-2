package com.shiptrack.customer.support.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.shiptrack.customer.support.dto.CustomerSupportResponseDto;
import com.shiptrack.customer.support.dto.RaiseIssueDto;
import com.shiptrack.customer.support.dto.ShipmentRequestDto;
import com.shiptrack.customer.support.service.CustomerSupportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customer/support")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerSupportController {

        private final CustomerSupportService customerSupportService;

        @PostMapping("/shipment")
        public ResponseEntity<String> createShipmentRequest(
                        @RequestBody ShipmentRequestDto request) {

                customerSupportService.createShipmentRequest(request);

                return ResponseEntity.ok(
                                "Shipment request submitted successfully.");
        }

        @PostMapping(value = "/issue", consumes = { "multipart/form-data" })
        public ResponseEntity<String> raiseIssue(

                        @RequestPart("request") RaiseIssueDto request,

                        @RequestPart(value = "attachment", required = false) MultipartFile attachment) {
                System.out.println("Controller reached!");

                customerSupportService.raiseIssue(request, attachment);

                return ResponseEntity.ok(
                                "Issue submitted successfully.");
        }

        @GetMapping("/my-requests")
        public ResponseEntity<List<CustomerSupportResponseDto>> getMyRequests() {

                return ResponseEntity.ok(
                                customerSupportService.getMyRequests());
        }

        @GetMapping("/requests/{id}")
        public ResponseEntity<?> getSupportRequestById(
                        @PathVariable Long id) {

                return ResponseEntity.ok(
                                customerSupportService.getSupportRequestById(id));
        }

}