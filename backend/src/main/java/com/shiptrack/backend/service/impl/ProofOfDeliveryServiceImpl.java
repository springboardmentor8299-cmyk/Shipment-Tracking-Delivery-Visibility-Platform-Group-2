package com.shiptrack.backend.service.impl;

import com.shiptrack.backend.entity.ProofOfDelivery;
import com.shiptrack.backend.entity.Shipment;
import com.shiptrack.backend.repository.ProofOfDeliveryRepository;
import com.shiptrack.backend.repository.ShipmentRepository;
import com.shiptrack.backend.service.ProofOfDeliveryService;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
public class ProofOfDeliveryServiceImpl
        implements ProofOfDeliveryService {

    private final ProofOfDeliveryRepository repository;

    private final ShipmentRepository shipmentRepository;

    public ProofOfDeliveryServiceImpl(
            ProofOfDeliveryRepository repository,
            ShipmentRepository shipmentRepository) {

        this.repository = repository;

        this.shipmentRepository = shipmentRepository;
    }

    @Override
    public ProofOfDelivery saveProof(

            Long shipmentId,

            String receiverName,

            String remarks,

            String signature,

            MultipartFile photo

    ) throws IOException {

        ProofOfDelivery proof = new ProofOfDelivery();

        // Find shipment
        Shipment shipment = shipmentRepository
                .findById(shipmentId)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found"));

        // Connect Proof of Delivery to Shipment
        proof.setShipment(shipment);

        proof.setReceiverName(receiverName);

        proof.setRemarks(remarks);

        proof.setSignature(signature);

        // Temporary photo filename
        if (photo != null && !photo.isEmpty()) {

            proof.setPhotoUrl(
                    photo.getOriginalFilename()
            );

        }

        proof.setDeliveredAt(
                LocalDateTime.now()
        );

        return repository.save(proof);
    }

    @Override
    public ProofOfDelivery getProofByShipmentId(
            Long shipmentId) {

        return repository
                .findByShipment_Id(shipmentId)
                .orElse(null);
    }
}