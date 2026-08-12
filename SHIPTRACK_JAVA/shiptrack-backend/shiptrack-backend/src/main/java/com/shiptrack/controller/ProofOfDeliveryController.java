package com.shiptrack.controller;

import com.shiptrack.dto.PodUploadRequest;
import com.shiptrack.dto.ProofOfDeliveryResponse;
import com.shiptrack.service.ProofOfDeliveryService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pod")
public class ProofOfDeliveryController {

    private final ProofOfDeliveryService proofOfDeliveryService;

    public ProofOfDeliveryController(ProofOfDeliveryService proofOfDeliveryService) {
        this.proofOfDeliveryService = proofOfDeliveryService;
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('DRIVER','ADMIN','SUPPORT')")
    public ProofOfDeliveryResponse upload(
            @RequestBody PodUploadRequest request) {

        return proofOfDeliveryService.upload(request);
    }

    @GetMapping("/{shipmentId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT','DRIVER','CUSTOMER')")
    public ProofOfDeliveryResponse getByShipmentId(
            @PathVariable Long shipmentId) {

        return proofOfDeliveryService.getByShipmentId(shipmentId);
    }

    @GetMapping("/download/{shipmentId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT','DRIVER','CUSTOMER')")
    public ResponseEntity<byte[]> download(
            @PathVariable Long shipmentId) {

        byte[] pdf = proofOfDeliveryService.downloadPdf(shipmentId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"pod-" + shipmentId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
