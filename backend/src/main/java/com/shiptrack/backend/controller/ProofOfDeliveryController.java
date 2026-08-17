package com.shiptrack.backend.controller;

import com.shiptrack.backend.entity.ProofOfDelivery;
import com.shiptrack.backend.service.ProofOfDeliveryService;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/proof")
@CrossOrigin(origins = "http://localhost:3000")
public class ProofOfDeliveryController {

    private final ProofOfDeliveryService service;

    public ProofOfDeliveryController(
            ProofOfDeliveryService service) {

        this.service = service;

    }

    // ================= SAVE PROOF OF DELIVERY =================

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProofOfDelivery saveProof(

            @RequestParam Long shipmentId,

            @RequestParam String receiverName,

            @RequestParam(required = false) String remarks,

            @RequestParam String signature,

            @RequestParam MultipartFile photo

    ) throws IOException {

        return service.saveProof(

                shipmentId,

                receiverName,

                remarks,

                signature,

                photo

        );

    }

    // ================= GET PROOF =================

    @GetMapping("/{shipmentId}")
    public ProofOfDelivery getProof(
            @PathVariable Long shipmentId) {

        return service.getProofByShipmentId(shipmentId);

    }

}