package com.shiptrack.shipment;

import com.shiptrack.dto.EtaResponse;
import com.shiptrack.dto.LocationUpdateRequest;
import com.shiptrack.service.EtaService;
import com.shiptrack.shipment.dto.ShipmentRequest;
import com.shiptrack.shipment.dto.ShipmentResponse;
import com.shiptrack.tracking.TrackingService;
import com.shiptrack.user.User;
import com.shiptrack.user.UserService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final UserService userService;
    private final TrackingService trackingService;
    private final EtaService etaService;

    public ShipmentService(
            ShipmentRepository shipmentRepository,
            UserService userService,
            TrackingService trackingService,
            EtaService etaService
    ) {
        this.shipmentRepository = shipmentRepository;
        this.userService = userService;
        this.trackingService = trackingService;
        this.etaService = etaService;
    }

    public ShipmentResponse createShipment(ShipmentRequest request) {

        User customer = userService.getLoggedInUser();

        Shipment shipment = new Shipment();

        shipment.setTrackingNumber(generateTrackingNumber());
        shipment.setSenderName(request.getSenderName());
        shipment.setReceiverName(request.getReceiverName());
        shipment.setSource(request.getSource());
        shipment.setDestination(request.getDestination());

        shipment.setCurrentLatitude(request.getSourceLatitude());
        shipment.setCurrentLongitude(request.getSourceLongitude());

        shipment.setDestinationLatitude(
                request.getDestinationLatitude()
        );

        shipment.setDestinationLongitude(
                request.getDestinationLongitude()
        );

        shipment.setLastLocationUpdate(LocalDateTime.now());
        shipment.setStatus(ShipmentStatus.PENDING);
        shipment.setCustomer(customer);

        Shipment savedShipment =
                shipmentRepository.save(shipment);

        trackingService.addTrackingEvent(
                savedShipment,
                ShipmentStatus.PENDING,
                savedShipment.getSource()
        );

        return mapToResponse(savedShipment);
    }

    public List<ShipmentResponse> getAllShipments() {

        return shipmentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ShipmentResponse> getMyShipments() {

        User customer = userService.getLoggedInUser();

        return shipmentRepository.findByCustomer(customer)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ShipmentResponse> getDeliveryHistory() {

        User customer = userService.getLoggedInUser();

        return shipmentRepository.findByCustomerAndStatus(
                        customer,
                        ShipmentStatus.DELIVERED
                )
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ShipmentResponse getShipmentByTrackingNumber(
            String trackingNumber
    ) {

        Shipment shipment = shipmentRepository
                .findByTrackingNumber(trackingNumber)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found")
                );

        return mapToResponse(shipment);
    }

    public ShipmentResponse updateShipmentStatus(
            String trackingNumber,
            ShipmentStatus status
    ) {

        Shipment shipment = shipmentRepository
                .findByTrackingNumber(trackingNumber)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found")
                );

        shipment.setStatus(status);

        Shipment updatedShipment =
                shipmentRepository.save(shipment);

        trackingService.addTrackingEvent(
                updatedShipment,
                status,
                updatedShipment.getDestination()
        );

        return mapToResponse(updatedShipment);
    }

    public ShipmentResponse updateLocation(
            String trackingNumber,
            LocationUpdateRequest request
    ) {

        Shipment shipment = shipmentRepository
                .findByTrackingNumber(trackingNumber)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found")
                );

        shipment.setCurrentLatitude(request.getLatitude());
        shipment.setCurrentLongitude(request.getLongitude());
        shipment.setLastLocationUpdate(LocalDateTime.now());

        if (request.getStatus() != null) {
            shipment.setStatus(request.getStatus());
        }

        EtaResponse etaResponse =
                etaService.calculateEta(shipment);

        shipment.setEstimatedDeliveryTime(
                etaResponse.getEstimatedDeliveryTime()
        );

        shipment.setPredictedDelayMinutes(
                etaResponse.getPredictedDelayMinutes()
        );

        shipment.setDelayReason(
                etaResponse.getDelayReason()
        );

        Shipment updatedShipment =
                shipmentRepository.save(shipment);

        trackingService.addTrackingEvent(
                updatedShipment,
                updatedShipment.getStatus(),
                request.getLocation()
        );

        return mapToResponse(updatedShipment);
    }

    private String generateTrackingNumber() {

        String trackingNumber;

        do {
            trackingNumber =
                    "STP-"
                            + UUID.randomUUID()
                            .toString()
                            .replace("-", "")
                            .substring(0, 10)
                            .toUpperCase();

        } while (
                shipmentRepository.existsByTrackingNumber(
                        trackingNumber
                )
        );

        return trackingNumber;
    }

    private ShipmentResponse mapToResponse(Shipment shipment) {

        ShipmentResponse response =
                new ShipmentResponse();

        response.setId(shipment.getId());
        response.setTrackingNumber(
                shipment.getTrackingNumber()
        );
        response.setSenderName(
                shipment.getSenderName()
        );
        response.setReceiverName(
                shipment.getReceiverName()
        );
        response.setSource(
                shipment.getSource()
        );
        response.setDestination(
                shipment.getDestination()
        );
        response.setStatus(
                shipment.getStatus()
        );
        response.setCreatedAt(
                shipment.getCreatedAt()
        );

        response.setCurrentLatitude(
                shipment.getCurrentLatitude()
        );
        response.setCurrentLongitude(
                shipment.getCurrentLongitude()
        );
        response.setDestinationLatitude(
                shipment.getDestinationLatitude()
        );
        response.setDestinationLongitude(
                shipment.getDestinationLongitude()
        );
        response.setEstimatedDeliveryTime(
                shipment.getEstimatedDeliveryTime()
        );
        response.setPredictedDelayMinutes(
                shipment.getPredictedDelayMinutes()
        );
        response.setDelayReason(
                shipment.getDelayReason()
        );
        response.setLastLocationUpdate(
                shipment.getLastLocationUpdate()
        );

        return response;
    }

    public Shipment findShipment(String trackingNumber) {

        return shipmentRepository
                .findByTrackingNumber(trackingNumber)
                .orElseThrow(() ->
                        new RuntimeException("Shipment not found")
                );
    }
}