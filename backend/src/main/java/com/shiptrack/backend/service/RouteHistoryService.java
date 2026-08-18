package com.shiptrack.backend.service;

import com.shiptrack.backend.entity.RouteHistory;
import com.shiptrack.backend.repository.RouteHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RouteHistoryService {

    private final RouteHistoryRepository routeHistoryRepository;

    public RouteHistoryService(RouteHistoryRepository routeHistoryRepository) {
        this.routeHistoryRepository = routeHistoryRepository;
    }

    @Transactional
    public RouteHistory recordSnapshot(Long shipmentId, Double lat, Double lng, String status, String locationName) {
        if (lat == null || lng == null) return null;

        RouteHistory history = new RouteHistory(
                shipmentId,
                lat,
                lng,
                status != null ? status : "IN_TRANSIT",
                LocalDateTime.now(),
                locationName != null ? locationName : "Route Checkpoint"
        );
        return routeHistoryRepository.save(history);
    }

    public List<RouteHistory> getRouteHistory(Long shipmentId) {
        return routeHistoryRepository.findByShipmentIdOrderByTimestampAsc(shipmentId);
    }
}
