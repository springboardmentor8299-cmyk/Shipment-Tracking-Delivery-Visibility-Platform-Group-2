package com.shiptrack.pod;

import com.shiptrack.pod.dto.PodRequest;
import com.shiptrack.pod.dto.PodResponse;
import com.shiptrack.shipment.Shipment;
import com.shiptrack.shipment.ShipmentRepository;
import com.shiptrack.shipment.ShipmentStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.shiptrack.tracking.TrackingService;
import java.util.List;

@Service
public class ProofOfDeliveryService {

    private final ProofOfDeliveryRepository proofOfDeliveryRepository;
    private final ShipmentRepository shipmentRepository;
    private final TrackingService trackingService;

    public ProofOfDeliveryService(
            ProofOfDeliveryRepository proofOfDeliveryRepository,
            ShipmentRepository shipmentRepository,
            TrackingService trackingService
    ) {
        this.proofOfDeliveryRepository = proofOfDeliveryRepository;
        this.shipmentRepository = shipmentRepository;
        this.trackingService = trackingService;
    }

    @Transactional
    public PodResponse createProofOfDelivery(
            String trackingNumber,
            PodRequest request
    ) {
        Shipment shipment = shipmentRepository
                .findByTrackingNumber(trackingNumber)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found")
                );

        if (proofOfDeliveryRepository.existsByShipment(shipment)) {
            throw new RuntimeException(
                    "Proof of delivery already exists for this shipment"
            );
        }

        if (shipment.getStatus() == ShipmentStatus.DELIVERED) {
            throw new RuntimeException(
                    "Shipment is already delivered"
            );
        }

        validateRequest(request);

        ProofOfDelivery proofOfDelivery =
                new ProofOfDelivery();

        proofOfDelivery.setShipment(shipment);
        proofOfDelivery.setReceiverName(
                request.getReceiverName().trim()
        );
        proofOfDelivery.setSignatureData(
                request.getSignatureData()
        );
        proofOfDelivery.setDeliveryPhoto(
                request.getDeliveryPhoto()
        );
        proofOfDelivery.setDeliveryNotes(
                normalizeText(request.getDeliveryNotes())
        );
        proofOfDelivery.setLatitude(
                request.getLatitude()
        );
        proofOfDelivery.setLongitude(
                request.getLongitude()
        );
        proofOfDelivery.setVerificationStatus(
                VerificationStatus.PENDING
        );

        ProofOfDelivery savedProof =
                proofOfDeliveryRepository.save(
                        proofOfDelivery
                );

        shipment.setProofOfDelivery(savedProof);
        shipment.setStatus(ShipmentStatus.DELIVERED);

        if (request.getLatitude() != null) {
            shipment.setCurrentLatitude(
                    request.getLatitude()
            );
        }

        if (request.getLongitude() != null) {
            shipment.setCurrentLongitude(
                    request.getLongitude()
            );
        }

        Shipment updatedShipment =
                shipmentRepository.save(shipment);

        trackingService.addTrackingEvent(
                updatedShipment,
                ShipmentStatus.DELIVERED,
                updatedShipment.getDestination()
        );

        return mapToResponse(savedProof);
    }

    public PodResponse getProofOfDelivery(
            String trackingNumber
    ) {
        Shipment shipment = shipmentRepository
                .findByTrackingNumber(trackingNumber)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found")
                );

        ProofOfDelivery proofOfDelivery =
                proofOfDeliveryRepository
                        .findByShipment(shipment)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Proof of delivery not found"
                                )
                        );

        return mapToResponse(proofOfDelivery);
    }

    @Transactional
    public PodResponse verifyProofOfDelivery(
            Long proofOfDeliveryId
    ) {
        ProofOfDelivery proofOfDelivery =
                proofOfDeliveryRepository
                        .findById(proofOfDeliveryId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Proof of delivery not found"
                                )
                        );

        proofOfDelivery.setVerificationStatus(
                VerificationStatus.VERIFIED
        );

        return mapToResponse(
                proofOfDeliveryRepository.save(
                        proofOfDelivery
                )
        );
    }

    @Transactional
    public PodResponse rejectProofOfDelivery(
            Long proofOfDeliveryId
    ) {
        ProofOfDelivery proofOfDelivery =
                proofOfDeliveryRepository
                        .findById(proofOfDeliveryId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Proof of delivery not found"
                                )
                        );

        proofOfDelivery.setVerificationStatus(
                VerificationStatus.REJECTED
        );

        return mapToResponse(
                proofOfDeliveryRepository.save(
                        proofOfDelivery
                )
        );
    }

    private void validateRequest(PodRequest request) {
        if (request == null) {
            throw new RuntimeException(
                    "Proof of delivery request is required"
            );
        }

        if (
                request.getReceiverName() == null ||
                        request.getReceiverName().isBlank()
        ) {
            throw new RuntimeException(
                    "Receiver name is required"
            );
        }

        if (
                request.getSignatureData() == null ||
                        request.getSignatureData().isBlank()
        ) {
            throw new RuntimeException(
                    "Receiver signature is required"
            );
        }

        validateCoordinates(
                request.getLatitude(),
                request.getLongitude()
        );
    }

    private void validateCoordinates(
            Double latitude,
            Double longitude
    ) {
        if (
                (latitude == null && longitude != null) ||
                        (latitude != null && longitude == null)
        ) {
            throw new RuntimeException(
                    "Latitude and longitude must be provided together"
            );
        }

        if (
                latitude != null &&
                        (latitude < -90 || latitude > 90)
        ) {
            throw new RuntimeException(
                    "Latitude must be between -90 and 90"
            );
        }

        if (
                longitude != null &&
                        (longitude < -180 || longitude > 180)
        ) {
            throw new RuntimeException(
                    "Longitude must be between -180 and 180"
            );
        }
    }

    private String normalizeText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private PodResponse mapToResponse(
            ProofOfDelivery proofOfDelivery
    ) {
        PodResponse response = new PodResponse();

        response.setId(proofOfDelivery.getId());
        response.setShipmentId(
                proofOfDelivery.getShipment().getId()
        );
        response.setTrackingNumber(
                proofOfDelivery
                        .getShipment()
                        .getTrackingNumber()
        );
        response.setReceiverName(
                proofOfDelivery.getReceiverName()
        );
        response.setSignatureData(
                proofOfDelivery.getSignatureData()
        );
        response.setDeliveryNotes(
                proofOfDelivery.getDeliveryNotes()
        );
        response.setVerificationStatus(
                proofOfDelivery.getVerificationStatus()
        );
        response.setLatitude(
                proofOfDelivery.getLatitude()
        );
        response.setLongitude(
                proofOfDelivery.getLongitude()
        );
        response.setDeliveredAt(
                proofOfDelivery.getDeliveredAt()
        );
        response.setDeliveryPhoto(
                proofOfDelivery.getDeliveryPhoto()
        );

        return response;
    }

    public List<PodResponse> getPendingProofs() {

        return proofOfDeliveryRepository
                .findByVerificationStatus(
                        VerificationStatus.PENDING
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

}