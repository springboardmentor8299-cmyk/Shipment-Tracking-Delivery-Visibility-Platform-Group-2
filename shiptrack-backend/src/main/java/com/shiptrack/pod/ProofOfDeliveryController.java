package com.shiptrack.pod;

import com.shiptrack.pod.dto.PodRequest;
import com.shiptrack.pod.dto.PodResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping("/api/pod")
@CrossOrigin(origins = "http://localhost:5173")
public class ProofOfDeliveryController {

    private final ProofOfDeliveryService proofOfDeliveryService;

    public ProofOfDeliveryController(
            ProofOfDeliveryService proofOfDeliveryService
    ) {
        this.proofOfDeliveryService = proofOfDeliveryService;
    }

    @PostMapping("/{trackingNumber}")
    @PreAuthorize("hasRole('LOGISTICS_OPERATOR')")
    public ResponseEntity<PodResponse> createProofOfDelivery(
            @PathVariable String trackingNumber,
            @RequestBody PodRequest request
    ) {
        return ResponseEntity.ok(
                proofOfDeliveryService.createProofOfDelivery(
                        trackingNumber,
                        request
                )
        );
    }

    @GetMapping("/{trackingNumber}")
    @PreAuthorize(
            "hasAnyRole('ADMINISTRATOR','LOGISTICS_OPERATOR','CUSTOMER','BUSINESS_CLIENT')"
    )
    public ResponseEntity<PodResponse> getProofOfDelivery(
            @PathVariable String trackingNumber
    ) {
        return ResponseEntity.ok(
                proofOfDeliveryService.getProofOfDelivery(
                        trackingNumber
                )
        );
    }

    @PutMapping("/{proofOfDeliveryId}/verify")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<PodResponse> verifyProofOfDelivery(
            @PathVariable Long proofOfDeliveryId
    ) {
        return ResponseEntity.ok(
                proofOfDeliveryService.verifyProofOfDelivery(
                        proofOfDeliveryId
                )
        );
    }

    @PutMapping("/{proofOfDeliveryId}/reject")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<PodResponse> rejectProofOfDelivery(
            @PathVariable Long proofOfDeliveryId
    ) {
        return ResponseEntity.ok(
                proofOfDeliveryService.rejectProofOfDelivery(
                        proofOfDeliveryId
                )
        );
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    public ResponseEntity<List<PodResponse>> getPendingProofs() {

        return ResponseEntity.ok(
                proofOfDeliveryService.getPendingProofs()
        );
    }
}