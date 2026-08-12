package com.shiptrack.controller;

import com.shiptrack.dto.BusinessRequest;
import com.shiptrack.dto.BusinessResponse;
import com.shiptrack.dto.BusinessStatsResponse;
import com.shiptrack.service.BusinessService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/businesses")
@CrossOrigin(origins = "*")
public class BusinessController {

    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    


    @GetMapping
    public ResponseEntity<List<BusinessResponse>> getAllBusinesses() {

        return ResponseEntity.ok(
                businessService.getAllBusinesses()
        );
    }

    


    @GetMapping("/{id}")
    public ResponseEntity<BusinessResponse> getBusinessById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                businessService.getBusinessById(id)
        );
    }

    


    @PostMapping
    public ResponseEntity<BusinessResponse> createBusiness(
            @Valid @RequestBody BusinessRequest request) {

        BusinessResponse response =
                businessService.createBusiness(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    


    @PutMapping("/{id}")
    public ResponseEntity<BusinessResponse> updateBusiness(
            @PathVariable Long id,
            @Valid @RequestBody BusinessRequest request) {

        return ResponseEntity.ok(
                businessService.updateBusiness(id, request)
        );
    }

    


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBusiness(
            @PathVariable Long id) {

        businessService.deleteBusiness(id);

        return ResponseEntity.ok(
                "Business deleted successfully."
        );
    }

    


    @GetMapping("/stats")
    public ResponseEntity<BusinessStatsResponse> getBusinessStats() {

        return ResponseEntity.ok(
                businessService.getBusinessStats()
        );
    }

    


    @GetMapping("/search")
    public ResponseEntity<List<BusinessResponse>> searchBusinesses(
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                businessService.searchBusinesses(keyword)
        );
    }

}
