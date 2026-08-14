package com.shiptrack.service;

import com.shiptrack.dto.EtaResponse;
import com.shiptrack.dto.LatLng;
import com.shiptrack.entity.RouteHistoryPoint;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.TrackingEvent;
import com.shiptrack.repository.RouteHistoryPointRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.TrackingEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class EtaService {

    private final ShipmentRepository shipmentRepository;
    private final TrackingEventRepository trackingEventRepository;
    private final RouteHistoryPointRepository routeHistoryPointRepository;
    private final GeocodingService geocodingService;
    private final LiveTrackingService liveTrackingService;

    private final Set<Long> warnedNoDestination = ConcurrentHashMap.newKeySet();

    @Transactional
    public EtaResponse calculateEta(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId).orElse(null);
        if (shipment == null) return null;

        if (shipment.getDestinationLatitude() == null || shipment.getDestinationLongitude() == null) {
            if (warnedNoDestination.add(shipmentId)) {
                log.warn("Cannot calculate ETA for shipment {}: no destination coordinates. Falling back to distance estimate.", shipmentId);
            }

            if (shipment.getTotalDistance() != null) {
                Long durationMin = estimateDurationByDistance(shipment);
                LocalDateTime estimatedDeliveryTime = LocalDateTime.now().plusMinutes(durationMin);
                shipmentRepository.updateEtaFields(shipmentId, durationMin, estimatedDeliveryTime);
                liveTrackingService.broadcastEtaUpdate(shipmentId, estimatedDeliveryTime);
                return EtaResponse.builder()
                        .estimatedDeliveryTime(estimatedDeliveryTime)
                        .estimatedDurationMin(durationMin)
                        .totalDistanceKm(shipment.getTotalDistance())
                        .lastRecalculatedAt(LocalDateTime.now())
                        .build();
            }

            return null;
        }

        warnedNoDestination.remove(shipmentId);

        List<TrackingEvent> events = trackingEventRepository
                .findByShipmentIdOrderByRecordedAtAsc(shipment.getId());

        TrackingEvent latest = events.stream()
                .max(Comparator.comparing(TrackingEvent::getId))
                .orElse(null);

        RouteHistoryPoint latestPoint = routeHistoryPointRepository
                .findTopByShipmentIdOrderByRecordedAtDesc(shipmentId)
                .orElse(null);

        Double originLat = latestPoint != null && latestPoint.getLatitude() != null
                ? latestPoint.getLatitude()
                : (latest != null && latest.getLatitude() != null
                        ? latest.getLatitude()
                        : shipment.getOriginLatitude());
        Double originLng = latestPoint != null && latestPoint.getLongitude() != null
                ? latestPoint.getLongitude()
                : (latest != null && latest.getLongitude() != null
                        ? latest.getLongitude()
                        : shipment.getOriginLongitude());

        if (originLat == null || originLng == null) {
            return null;
        }

        LatLng origin = new LatLng(originLat, originLng);
        LatLng destination = new LatLng(
                shipment.getDestinationLatitude(), shipment.getDestinationLongitude());

        Long durationMin = geocodingService.calculateDuration(origin, destination);

        if (durationMin == null) {
            durationMin = estimateDurationByDistance(shipment);
        }

        LocalDateTime estimatedDeliveryTime = LocalDateTime.now().plusMinutes(durationMin);

        shipmentRepository.updateEtaFields(shipmentId, durationMin, estimatedDeliveryTime);

        liveTrackingService.broadcastEtaUpdate(shipmentId, estimatedDeliveryTime);

        log.info("ETA calculated for shipment {}: {} min, delivery at {}",
                shipmentId, durationMin, estimatedDeliveryTime);

        return EtaResponse.builder()
                .estimatedDeliveryTime(estimatedDeliveryTime)
                .estimatedDurationMin(durationMin)
                .totalDistanceKm(shipment.getTotalDistance())
                .lastRecalculatedAt(LocalDateTime.now())
                .build();
    }

    @Async
    public void calculateEtaAsync(Long shipmentId) {
        calculateEta(shipmentId);
    }

    @Scheduled(fixedRate = 120000)
    @Transactional
    public void recalculateActiveEtas() {
        List<Shipment> activeShipments = shipmentRepository
                .findByStatusIn(List.of("IN_TRANSIT", "OUT_FOR_DELIVERY"));

        for (Shipment s : activeShipments) {
            try {
                calculateEta(s.getId());
            } catch (Exception e) {
                log.warn("Failed to recalculate ETA for shipment {}", s.getId(), e);
            }
        }
    }

    private Long estimateDurationByDistance(Shipment shipment) {
        if (shipment.getTotalDistance() == null) return 60L;
        double avgSpeed = 40.0;
        return (long) Math.ceil((shipment.getTotalDistance() / avgSpeed) * 60);
    }
}
