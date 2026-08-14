package com.shiptrack.service;

import com.shiptrack.dto.LatLng;
import com.shiptrack.dto.RouteHistoryPointResponse;
import com.shiptrack.entity.RouteHistoryPoint;
import com.shiptrack.entity.Shipment;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.RouteHistoryPointRepository;
import com.shiptrack.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RouteHistoryService {

    private final RouteHistoryPointRepository routeHistoryPointRepository;
    private final ShipmentRepository shipmentRepository;

    @Transactional
    public void recordPoint(Shipment shipment, LatLng position, Double speed, Double progress) {
        try {
            RouteHistoryPoint point = RouteHistoryPoint.builder()
                    .shipment(shipment)
                    .latitude(position.getLatitude())
                    .longitude(position.getLongitude())
                    .recordedAt(LocalDateTime.now())
                    .speed(speed)
                    .progress(progress)
                    .build();
            routeHistoryPointRepository.save(point);
        } catch (Exception e) {
            log.warn("Failed to record route history point for shipment {}", shipment.getId(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<RouteHistoryPointResponse> getRouteHistory(Long shipmentId) {
        if (!shipmentRepository.existsById(shipmentId)) {
            throw new ResourceNotFoundException("Shipment not found.");
        }

        return routeHistoryPointRepository.findByShipmentIdOrderByRecordedAtAsc(shipmentId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private RouteHistoryPointResponse toResponse(RouteHistoryPoint point) {
        return RouteHistoryPointResponse.builder()
                .id(point.getId())
                .latitude(point.getLatitude())
                .longitude(point.getLongitude())
                .recordedAt(point.getRecordedAt())
                .speed(point.getSpeed())
                .progress(point.getProgress())
                .build();
    }
}
