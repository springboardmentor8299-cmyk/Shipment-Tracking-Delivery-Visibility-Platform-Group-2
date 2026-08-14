package com.shiptrack.service;

import com.shiptrack.dto.LatLng;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.TrackingEvent;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.TrackingEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrackingSimulationService {

    private final ShipmentRepository shipmentRepository;
    private final LiveTrackingService liveTrackingService;
    private final RouteHistoryService routeHistoryService;
    private final TrackingEventRepository trackingEventRepository;

    private final Map<Long, LatLng> lastPositions = new ConcurrentHashMap<>();
    private final Map<Long, LocalDateTime> lastTimestamps = new ConcurrentHashMap<>();
    private final Map<Long, LocalDateTime> activeSince = new ConcurrentHashMap<>();
    private final Map<Long, String> lastStatuses = new ConcurrentHashMap<>();

    @Scheduled(fixedRate = 30000)
    public void simulateActiveShipments() {
        List<Shipment> active = shipmentRepository.findByStatusIn(List.of("IN_TRANSIT", "OUT_FOR_DELIVERY"));

        for (Shipment s : active) {
            try {
                simulateOne(s);
            } catch (Exception e) {
                log.warn("Simulation failed for shipment {}: {}", s.getId(), e.getMessage());
            }
        }
    }

    private LocalDateTime getActiveSince(Shipment s) {
        String status = s.getStatus();
        if (!status.equals(lastStatuses.get(s.getId()))) {
            LocalDateTime found = trackingEventRepository.findByShipmentIdOrderByRecordedAtAsc(s.getId())
                    .stream()
                    .filter(e -> "IN_TRANSIT".equals(e.getStatus()) || "OUT_FOR_DELIVERY".equals(e.getStatus()))
                    .filter(e -> e.getRecordedAt() != null)
                    .min(Comparator.comparing(TrackingEvent::getRecordedAt))
                    .map(TrackingEvent::getRecordedAt)
                    .orElse(null);
            activeSince.put(s.getId(), found != null ? found : LocalDateTime.now());
            lastStatuses.put(s.getId(), status);
        }
        return activeSince.get(s.getId());
    }

    private void simulateOne(Shipment s) {
        if (s.getCreatedAt() == null) return;

        long estimatedDuration = s.getEstimatedDuration() != null ? s.getEstimatedDuration() : estimateDuration(s);
        if (estimatedDuration <= 0) return;

        long elapsedMinutes = ChronoUnit.MINUTES.between(getActiveSince(s), LocalDateTime.now());
        double progress = Math.min((double) elapsedMinutes / estimatedDuration, 1.0);

        if (progress >= 1.0) return;

        List<LatLng> route = getRoutePoints(s);
        if (route.isEmpty()) return;

        LatLng position = interpolate(route, progress);

        double speed = 0;
        LatLng lastPos = lastPositions.get(s.getId());
        LocalDateTime lastTs = lastTimestamps.get(s.getId());
        if (lastPos != null && lastTs != null) {
            double distKm = haversine(lastPos, position);
            double hours = ChronoUnit.SECONDS.between(lastTs, LocalDateTime.now()) / 3600.0;
            if (hours > 0) {
                speed = distKm / hours;
            }
        }

        lastPositions.put(s.getId(), position);
        lastTimestamps.put(s.getId(), LocalDateTime.now());

        routeHistoryService.recordPoint(s, position, speed, progress);

        liveTrackingService.broadcastLocationUpdate(
                s.getId(),
                position.getLatitude(),
                position.getLongitude(),
                s.getStatus(),
                speed,
                progress,
                estimatedDuration
        );
    }

    private long estimateDuration(Shipment s) {
        if (s.getTotalDistance() == null || s.getTotalDistance() <= 0) return 60L;
        return (long) Math.ceil((s.getTotalDistance() / 40.0) * 60);
    }

    private List<LatLng> getRoutePoints(Shipment s) {
        if (s.getRoutePolyline() != null) {
            try {
                List<LatLng> decoded = PolylineDecoder.decode(s.getRoutePolyline());
                if (!decoded.isEmpty()) return decoded;
            } catch (Exception e) {
                log.debug("Failed to decode polyline for shipment {}, using straight line", s.getId());
            }
        }

        if (s.getOriginLatitude() != null && s.getOriginLongitude() != null
                && s.getDestinationLatitude() != null && s.getDestinationLongitude() != null) {
            return List.of(
                    new LatLng(s.getOriginLatitude(), s.getOriginLongitude()),
                    new LatLng(s.getDestinationLatitude(), s.getDestinationLongitude())
            );
        }

        return List.of();
    }

    static LatLng interpolate(List<LatLng> points, double progress) {
        if (points.isEmpty()) return null;
        if (points.size() == 1 || progress <= 0) return points.get(0);
        if (progress >= 1) return points.get(points.size() - 1);

        double[] cumulative = new double[points.size()];
        for (int i = 1; i < points.size(); i++) {
            cumulative[i] = cumulative[i - 1] + haversine(points.get(i - 1), points.get(i));
        }

        double totalDist = cumulative[cumulative.length - 1];
        if (totalDist <= 0) return points.get(0);

        double targetDist = totalDist * progress;

        for (int i = 1; i < points.size(); i++) {
            if (cumulative[i] >= targetDist) {
                double segDist = cumulative[i] - cumulative[i - 1];
                double segProgress = segDist > 0 ? (targetDist - cumulative[i - 1]) / segDist : 0;

                LatLng a = points.get(i - 1);
                LatLng b = points.get(i);
                return new LatLng(
                        a.getLatitude() + (b.getLatitude() - a.getLatitude()) * segProgress,
                        a.getLongitude() + (b.getLongitude() - a.getLongitude()) * segProgress
                );
            }
        }

        return points.get(points.size() - 1);
    }

    static double haversine(LatLng a, LatLng b) {
        double R = 6371;
        double dLat = Math.toRadians(b.getLatitude() - a.getLatitude());
        double dLon = Math.toRadians(b.getLongitude() - a.getLongitude());
        double lat1 = Math.toRadians(a.getLatitude());
        double lat2 = Math.toRadians(b.getLatitude());
        double sinLat = Math.sin(dLat / 2);
        double sinLon = Math.sin(dLon / 2);
        double h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
        return 2 * R * Math.asin(Math.sqrt(h));
    }
}
