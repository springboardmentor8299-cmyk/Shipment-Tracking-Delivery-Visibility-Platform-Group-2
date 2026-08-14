package com.shiptrack.service;

import com.shiptrack.dto.DelayStatusResponse;
import com.shiptrack.dto.LatLng;
import com.shiptrack.entity.DelayPrediction;
import com.shiptrack.entity.RouteHistoryPoint;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.TrackingEvent;
import com.shiptrack.repository.DelayPredictionRepository;
import com.shiptrack.repository.RouteHistoryPointRepository;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.TrackingEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DelayPredictionService {

    private final ShipmentRepository shipmentRepository;
    private final TrackingEventRepository trackingEventRepository;
    private final RouteHistoryPointRepository routeHistoryPointRepository;
    private final DelayPredictionRepository delayPredictionRepository;
    private final GeocodingService geocodingService;
    private final LiveTrackingService liveTrackingService;

    @Transactional
    public Optional<DelayPrediction> checkForDelays(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId).orElse(null);
        if (shipment == null) return Optional.empty();

        String status = shipment.getStatus();
        if ("DELIVERED".equals(status) || "CANCELLED".equals(status) || "RETURNED".equals(status)) {
            return Optional.empty();
        }

        List<TrackingEvent> events = trackingEventRepository
                .findByShipmentIdOrderByRecordedAtAsc(shipmentId);

        TrackingEvent latest = events.stream()
                .max(Comparator.comparing(TrackingEvent::getId))
                .orElse(null);

        RouteHistoryPoint latestPoint = routeHistoryPointRepository
                .findTopByShipmentIdOrderByRecordedAtDesc(shipmentId)
                .orElse(null);

        LocalDateTime lastKnownTime = latestPoint != null ? latestPoint.getRecordedAt()
                : (latest != null ? latest.getRecordedAt() : null);

        DelayPrediction.DelayPredictionBuilder builder = DelayPrediction.builder()
                .shipment(shipment)
                .detectedAt(LocalDateTime.now());

        String reason = null;
        Integer delayMinutes = null;
        Double probability = null;

        // Check 1: Stale tracking - no update in 30+ minutes during active delivery
        if (lastKnownTime != null && ("IN_TRANSIT".equals(status) || "OUT_FOR_DELIVERY".equals(status))) {
            long minutesSinceUpdate = ChronoUnit.MINUTES.between(lastKnownTime, LocalDateTime.now());
            if (minutesSinceUpdate > 30) {
                reason = "No location update for " + minutesSinceUpdate + " minutes";
                delayMinutes = (int) Math.min(minutesSinceUpdate, 120);
                probability = Math.min(0.5 + (minutesSinceUpdate / 60.0) * 0.2, 0.9);
            }
        }

        // Check 2: Overdue - shipment exceeded estimated duration
        if (reason == null && shipment.getEstimatedDuration() != null && latest != null) {
            long elapsedMinutes = ChronoUnit.MINUTES.between(
                    events.stream().findFirst().map(TrackingEvent::getRecordedAt).orElse(LocalDateTime.now()),
                    LocalDateTime.now());
            if (elapsedMinutes > shipment.getEstimatedDuration() * 1.2 && elapsedMinutes > 30) {
                reason = "Shipment is behind schedule";
                delayMinutes = (int) (elapsedMinutes - shipment.getEstimatedDuration());
                probability = Math.min(0.6 + (delayMinutes / 30.0) * 0.1, 0.95);
            }
        }

        // Check 3: Route traffic delay
        if (reason == null && latest != null && latest.getLatitude() != null
                && shipment.getDestinationLatitude() != null) {
            try {
                LatLng origin = new LatLng(latest.getLatitude(), latest.getLongitude());
                LatLng dest = new LatLng(
                        shipment.getDestinationLatitude(), shipment.getDestinationLongitude());
                Long currentDuration = geocodingService.calculateDuration(origin, dest);

                if (currentDuration != null && shipment.getEstimatedDuration() != null
                        && currentDuration > shipment.getEstimatedDuration() * 1.25) {
                    int extra = (int) (currentDuration - shipment.getEstimatedDuration());
                    reason = "Heavy traffic detected on route";
                    delayMinutes = extra;
                    probability = Math.min(0.5 + (extra / 15.0) * 0.1, 0.85);
                }
            } catch (Exception e) {
                log.warn("Failed to check traffic delay for shipment {}", shipmentId, e);
            }
        }

        if (reason != null) {
            Optional<DelayPrediction> existing = delayPredictionRepository
                    .findTopByShipmentAndIsActiveTrueOrderByDetectedAtDesc(shipment);

            if (existing.isPresent()
                    && Objects.equals(existing.get().getDelayReason(), reason)
                    && Objects.equals(existing.get().getDelayMinutes(), delayMinutes)) {
                log.debug("Delay already active for shipment {}: {}", shipmentId, reason);
                return existing;
            }

            List<DelayPrediction> actives = delayPredictionRepository.findByShipmentAndIsActiveTrue(shipment);
            if (!actives.isEmpty()) {
                actives.forEach(d -> d.setIsActive(false));
                delayPredictionRepository.saveAll(actives);
                log.info("Superseded {} stale delay prediction(s) for shipment {}", actives.size(), shipmentId);
            }

            builder.delayReason(reason)
                    .delayMinutes(delayMinutes)
                    .probability(probability)
                    .isActive(true);

            DelayPrediction prediction = builder.build();
            delayPredictionRepository.save(prediction);

            liveTrackingService.broadcastDelayAlert(shipmentId, reason, delayMinutes, probability);

            log.warn("Delay detected for shipment {}: {} ({} min)", shipmentId, reason, delayMinutes);
            return Optional.of(prediction);
        }

        List<DelayPrediction> active = delayPredictionRepository.findByShipmentAndIsActiveTrue(shipment);
        if (!active.isEmpty()) {
            active.forEach(d -> d.setIsActive(false));
            delayPredictionRepository.saveAll(active);
            log.info("Delay resolved for shipment {}", shipmentId);
        }

        return Optional.empty();
    }

    @Scheduled(fixedRate = 60000)
    public void checkAllActiveShipments() {
        List<Shipment> activeShipments = shipmentRepository
                .findByStatusIn(List.of("IN_TRANSIT", "OUT_FOR_DELIVERY"));

        for (Shipment s : activeShipments) {
            try {
                checkForDelays(s.getId());
            } catch (Exception e) {
                log.warn("Failed to check delays for shipment {}", s.getId(), e);
            }
        }
    }

    @Transactional(readOnly = true)
    public DelayStatusResponse getDelayStatus(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId).orElse(null);
        if (shipment == null) return null;

        Optional<DelayPrediction> active = delayPredictionRepository
                .findTopByShipmentAndIsActiveTrueOrderByDetectedAtDesc(shipment);

        if (active.isPresent()) {
            DelayPrediction d = active.get();
            return DelayStatusResponse.builder()
                    .id(d.getId())
                    .delayMinutes(d.getDelayMinutes())
                    .delayReason(d.getDelayReason())
                    .probability(d.getProbability())
                    .detectedAt(d.getDetectedAt())
                    .hasDelay(true)
                    .build();
        }

        return DelayStatusResponse.builder()
                .hasDelay(false)
                .build();
    }
}
