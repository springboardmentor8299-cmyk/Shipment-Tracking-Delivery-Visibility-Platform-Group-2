package com.shiptrack.controller;

import com.shiptrack.dto.ProofOfDeliveryRequest;
import com.shiptrack.dto.ProofOfDeliveryResponse;
import com.shiptrack.dto.ProofOfDeliveryVerifyRequest;
import com.shiptrack.service.ProofOfDeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ProofOfDeliveryController {

    private final ProofOfDeliveryService proofOfDeliveryService;

    @PostMapping("/shipments/{id}/proof-of-delivery")
    public ResponseEntity<ProofOfDeliveryResponse> capture(
            @PathVariable Long id,
            @Valid @RequestBody ProofOfDeliveryRequest request,
            Authentication authentication) {
        ProofOfDeliveryResponse response = proofOfDeliveryService.create(id, request, authentication.getName());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/shipments/{id}/proof-of-delivery")
    public ResponseEntity<ProofOfDeliveryResponse> getByShipment(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(proofOfDeliveryService.getByShipment(id, authentication.getName()));
    }

    @GetMapping("/proof-of-delivery")
    public ResponseEntity<List<ProofOfDeliveryResponse>> getAll(Authentication authentication) {
        return ResponseEntity.ok(proofOfDeliveryService.getAll(authentication.getName()));
    }

    @PatchMapping("/proof-of-delivery/{id}/verify")
    public ResponseEntity<ProofOfDeliveryResponse> verify(
            @PathVariable Long id,
            @Valid @RequestBody ProofOfDeliveryVerifyRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(proofOfDeliveryService.verify(id, request, authentication.getName()));
    }
}
