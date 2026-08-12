package com.shiptrack.service;

import com.shiptrack.dto.tracking.LiveDeliveryMonitorResponse;
import com.shiptrack.dto.tracking.ShipmentMonitoringResponse;
import com.shiptrack.entity.DeliveryConfirmationStatus;
import com.shiptrack.entity.DriverLocation;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.ShipmentStatus;
import com.shiptrack.repository.DeliveryConfirmationRepository;
import com.shiptrack.repository.DriverLocationRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.util.GoogleMapUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DeliveryMonitoringServiceImpl implements DeliveryMonitoringService {

    private final ShipmentRepository shipmentRepository;
    private final DriverLocationRepository driverLocationRepository;
    private final DeliveryConfirmationRepository deliveryConfirmationRepository;

    @Value("${google.maps.api.key:}")
    private String googleMapsApiKey;

    public DeliveryMonitoringServiceImpl(ShipmentRepository shipmentRepository,
                                         DriverLocationRepository driverLocationRepository,
                                         DeliveryConfirmationRepository deliveryConfirmationRepository) {
        this.shipmentRepository = shipmentRepository;
        this.driverLocationRepository = driverLocationRepository;
        this.deliveryConfirmationRepository = deliveryConfirmationRepository;
    }

    @Override
    public LiveDeliveryMonitorResponse getLiveDeliveryMonitoring(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new RuntimeException("Shipment not found."));

        LiveDeliveryMonitorResponse response = new LiveDeliveryMonitorResponse();
        response.setShipmentId(shipment.getId());
        response.setTrackingNumber(shipment.getTrackingNumber());
        response.setShipmentStatus(shipment.getShipmentStatus().name());
        response.setDestinationAddress(shipment.getReceiverAddress());

        if (shipment.getDriver() == null) {
            response.setDeliveryForecast("No driver assigned yet.");
            response.setEtaLabel("Pending assignment");
            response.setDelayReason("Driver has not been assigned.");
            return response;
        }

        response.setDriverName(shipment.getDriver().getFullName());

        DriverLocation location = driverLocationRepository.findByDriver(shipment.getDriver())
                .orElse(null);

        if (location == null) {
            response.setDeliveryForecast("Driver assigned, but no live location has been reported yet.");
            response.setEtaLabel("Awaiting driver signal");
            response.setDelayReason("Waiting for the first location update.");
            return response;
        }

        response.setDriverLatitude(location.getLatitude());
        response.setDriverLongitude(location.getLongitude());
        response.setEstimatedSpeedKmh(
                location.getSpeed() == null || location.getSpeed() <= 0 ? 35.0 : location.getSpeed());

        double[] destination = guessDestinationCoordinates(shipment);
        response.setDestinationLatitude(destination[0]);
        response.setDestinationLongitude(destination[1]);

        double distanceKm = GoogleMapUtil.calculateDistance(
                location.getLatitude(),
                location.getLongitude(),
                destination[0],
                destination[1]);
        response.setDistanceKm(distanceKm);

        long etaMinutes = Math.max(1L, Math.round(
                GoogleMapUtil.calculateEta(distanceKm, response.getEstimatedSpeedKmh()) * 60.0));
        response.setEtaMinutes(etaMinutes);
        response.setEtaLabel(formatEtaLabel(etaMinutes));

        boolean delayed = isDelayed(shipment.getShipmentStatus(), etaMinutes);
        response.setDelayed(delayed);

        String forecast = buildForecast(shipment.getShipmentStatus(), etaMinutes, delayed);
        response.setDeliveryForecast(forecast);
        response.setDelayReason(buildDelayReason(shipment.getShipmentStatus(), etaMinutes, delayed));
        response.setGoogleMapsUrl(buildGoogleMapsUrl(location.getLatitude(), location.getLongitude(), destination[0], destination[1]));

        return response;
    }

    @Override
    public List<ShipmentMonitoringResponse> getAllShipmentMonitoring() {
        return shipmentRepository.findAll()
                .stream()
                .map(this::toShipmentMonitoringResponse)
                .toList();
    }

    @Override
    public ShipmentMonitoringResponse getShipmentMonitoring(Shipment shipment) {
        return toShipmentMonitoringResponse(shipment);
    }

    private ShipmentMonitoringResponse toShipmentMonitoringResponse(Shipment shipment) {
        ShipmentMonitoringResponse response = new ShipmentMonitoringResponse();
        response.setShipmentId(shipment.getId());
        response.setTrackingNumber(shipment.getTrackingNumber());
        response.setSenderName(shipment.getSenderName());
        response.setReceiverName(shipment.getReceiverName());
        response.setReceiverAddress(shipment.getReceiverAddress());
        response.setSourceAddress(shipment.getSourceAddress());
        response.setDestinationAddress(shipment.getDestinationAddress());
        response.setSourceLatitude(shipment.getSourceLatitude());
        response.setSourceLongitude(shipment.getSourceLongitude());
        response.setDestinationLatitude(shipment.getDestinationLatitude());
        response.setDestinationLongitude(shipment.getDestinationLongitude());
        response.setShipmentStatus(shipment.getShipmentStatus().name());
        response.setDriverName(shipment.getDriver() == null ? null : shipment.getDriver().getFullName());
        response.setPackageWeight(shipment.getPackageWeight());
        response.setCreatedBy(shipment.getCreatedBy() == null ? "System" : shipment.getCreatedBy().getFullName());
        response.setReachedDestination(Boolean.TRUE.equals(shipment.getReachedDestination()) || shipment.getShipmentStatus() == ShipmentStatus.DELIVERED);

        double distanceKm = shipment.getDistanceKm() != null
                ? shipment.getDistanceKm()
                : 0.0;
        if (distanceKm == 0.0 && shipment.getSourceLatitude() != null && shipment.getSourceLongitude() != null
                && shipment.getDestinationLatitude() != null && shipment.getDestinationLongitude() != null) {
            distanceKm = GoogleMapUtil.calculateDistance(
                    shipment.getSourceLatitude(),
                    shipment.getSourceLongitude(),
                    shipment.getDestinationLatitude(),
                    shipment.getDestinationLongitude());
        }
        response.setDistanceKm(distanceKm);

        double speed = distanceKm > 250 ? 45.0 : 35.0;
        long etaMinutes = shipment.getEstimatedMinutes() != null ? shipment.getEstimatedMinutes() : Math.max(1L, Math.round(GoogleMapUtil.calculateEta(distanceKm, speed) * 60.0));
        response.setEtaMinutes(etaMinutes);
        response.setEtaLabel(formatEtaLabel(etaMinutes));
        response.setDelayMinutes(shipment.getDelayMinutes() == null ? 0L : shipment.getDelayMinutes());

        double progress = calculateProgress(shipment, etaMinutes);
        response.setProgressPercent(progress);

        if (response.isReachedDestination()) {
            response.setCurrentLatitude(shipment.getDestinationLatitude());
            response.setCurrentLongitude(shipment.getDestinationLongitude());
            response.setMessage("Reached destination");

            deliveryConfirmationRepository
                    .findByShipmentAndDeliveryStatus(shipment, DeliveryConfirmationStatus.CONFIRMED)
                    .ifPresent(confirmation -> {
                        response.setDeliveryTime(confirmation.getDeliveryTime());
                        response.setDeliveryReceiverName(confirmation.getReceiverName());
                        response.setDeliveryRemarks(confirmation.getRemarks());
                        if (confirmation.getDriver() != null) {
                            response.setDeliveryDriverName(confirmation.getDriver().getFullName());
                        }
                    });
        } else {
            double[] current = interpolateCurrentPosition(shipment, progress);
            response.setCurrentLatitude(current[0]);
            response.setCurrentLongitude(current[1]);
            response.setMessage(buildShipmentMessage(shipment, etaMinutes));
        }

        response.setGoogleMapsUrl(buildGoogleMapsUrl(
                shipment.getSourceLatitude() == null ? 0.0 : shipment.getSourceLatitude(),
                shipment.getSourceLongitude() == null ? 0.0 : shipment.getSourceLongitude(),
                shipment.getDestinationLatitude() == null ? 0.0 : shipment.getDestinationLatitude(),
                shipment.getDestinationLongitude() == null ? 0.0 : shipment.getDestinationLongitude()));

        return response;
    }

    private double calculateProgress(Shipment shipment, long etaMinutes) {
        if (Boolean.TRUE.equals(shipment.getReachedDestination()) || shipment.getShipmentStatus() == ShipmentStatus.DELIVERED) {
            return 100.0;
        }
        if (shipment.getCreatedAt() == null || etaMinutes <= 0) {
            return 0.0;
        }
        long elapsedMinutes = Math.max(0L, Duration.between(shipment.getCreatedAt(), LocalDateTime.now()).toMinutes());
        return Math.max(0.0, Math.min(99.0, (elapsedMinutes * 100.0) / etaMinutes));
    }

    private double[] interpolateCurrentPosition(Shipment shipment, double progress) {
        double sourceLat = shipment.getSourceLatitude() == null ? 28.6139 : shipment.getSourceLatitude();
        double sourceLng = shipment.getSourceLongitude() == null ? 77.2090 : shipment.getSourceLongitude();
        double destLat = shipment.getDestinationLatitude() == null ? 28.6139 : shipment.getDestinationLatitude();
        double destLng = shipment.getDestinationLongitude() == null ? 77.2090 : shipment.getDestinationLongitude();
        double ratio = progress / 100.0;
        return new double[]{
                sourceLat + ((destLat - sourceLat) * ratio),
                sourceLng + ((destLng - sourceLng) * ratio)
        };
    }

    private String buildShipmentMessage(Shipment shipment, long etaMinutes) {
        if (shipment.getShipmentStatus() == ShipmentStatus.DELIVERED) {
            return "Reached destination";
        }
        if (shipment.getShipmentStatus() == ShipmentStatus.CANCELLED) {
            return "Shipment cancelled";
        }
        if (etaMinutes <= 60) {
            return "Arriving in under 1 hour";
        }
        return "Estimated arrival in " + formatEtaLabel(etaMinutes);
    }

    private boolean isDelayed(ShipmentStatus status, long etaMinutes) {
        long threshold;
        switch (status) {
            case CREATED, PENDING -> threshold = 24 * 60L;
            case IN_TRANSIT -> threshold = 12 * 60L;
            case OUT_FOR_DELIVERY -> threshold = 180L;
            case DELIVERED, CANCELLED -> threshold = 0L;
            default -> threshold = 12 * 60L;
        }
        return threshold > 0 && etaMinutes > threshold;
    }

    private String buildForecast(ShipmentStatus status, long etaMinutes, boolean delayed) {
        if (status == ShipmentStatus.DELIVERED) {
            return "Shipment has already been delivered.";
        }
        if (status == ShipmentStatus.CANCELLED) {
            return "Shipment has been cancelled.";
        }
        if (delayed) {
            return "Delivery is likely delayed by about " + Math.max(1, etaMinutes / 60) + " hour(s).";
        }
        if (etaMinutes <= 60) {
            return "Expected delivery within the next hour.";
        }
        if (etaMinutes <= 180) {
            return "Expected delivery later today.";
        }
        return "Expected delivery within the next " + Math.max(1, etaMinutes / 1440) + " day(s).";
    }

    private String buildDelayReason(ShipmentStatus status, long etaMinutes, boolean delayed) {
        if (status == ShipmentStatus.DELIVERED) {
            return "Delivered successfully.";
        }
        if (status == ShipmentStatus.CANCELLED) {
            return "Shipment was cancelled.";
        }
        if (delayed) {
            return "Estimated travel time exceeds the current status threshold.";
        }
        return "Live route and speed are within expected limits.";
    }

    private String formatEtaLabel(long etaMinutes) {
        long hours = etaMinutes / 60;
        long minutes = etaMinutes % 60;
        if (hours == 0) {
            return minutes + " min";
        }
        return hours + " hr " + minutes + " min";
    }

    private double[] guessDestinationCoordinates(Shipment shipment) {
        String address = shipment.getReceiverAddress() == null ? "" : shipment.getReceiverAddress().toLowerCase();
        if (address.contains("delhi")) return new double[]{28.6139, 77.2090};
        if (address.contains("mumbai")) return new double[]{19.0760, 72.8777};
        if (address.contains("bengaluru") || address.contains("bangalore")) return new double[]{12.9716, 77.5946};
        if (address.contains("chennai")) return new double[]{13.0827, 80.2707};
        if (address.contains("kolkata")) return new double[]{22.5726, 88.3639};
        if (address.contains("hyderabad")) return new double[]{17.3850, 78.4867};
        return new double[]{28.6139, 77.2090};
    }

    private String buildGoogleMapsUrl(double fromLat, double fromLng, double toLat, double toLng) {
        if (googleMapsApiKey == null || googleMapsApiKey.isBlank()) {
            return "https://www.google.com/maps/dir/" + fromLat + "," + fromLng + "/" + toLat + "," + toLng;
        }
        return "https://www.google.com/maps/dir/?api=1&origin=" + fromLat + "," + fromLng + "&destination=" + toLat + "," + toLng + "&travelmode=driving";
    }
}
