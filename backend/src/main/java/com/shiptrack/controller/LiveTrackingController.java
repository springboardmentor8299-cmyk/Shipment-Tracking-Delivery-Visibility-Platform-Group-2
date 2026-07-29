package com.shiptrack.controller;

import com.shiptrack.dto.*;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.TrackingEvent;
import com.shiptrack.repository.ShipmentRepository;
import com.shiptrack.repository.TrackingEventRepository;
import com.shiptrack.service.GeocodingService;
import com.shiptrack.service.LiveTrackingService;
import com.shiptrack.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class LiveTrackingController {

    private final ShipmentService shipmentService;
    private final LiveTrackingService liveTrackingService;
    private final ShipmentRepository shipmentRepository;
    private final TrackingEventRepository trackingEventRepository;
    private final GeocodingService geocodingService;

    @GetMapping("/{id}/live")
    public ResponseEntity<LiveTrackingResponse> getLiveTracking(@PathVariable Long id) {
        Shipment shipment = shipmentRepository.findById(id).orElse(null);
        if (shipment == null) {
            return ResponseEntity.notFound().build();
        }

        List<TrackingEvent> events = trackingEventRepository
                .findByShipmentIdOrderByRecordedAtAsc(shipment.getId());

        TrackingEvent latest = events.stream()
                .max(Comparator.comparing(TrackingEvent::getId))
                .orElse(null);

        List<TrackingEventResponse> recentEvents = events.stream()
                .skip(Math.max(0, events.size() - 5))
                .map(e -> TrackingEventResponse.builder()
                        .id(e.getId())
                        .latitude(e.getLatitude())
                        .longitude(e.getLongitude())
                        .status(e.getStatus())
                        .recordedAt(e.getRecordedAt())
                        .build())
                .collect(Collectors.toList());

        String polyline = shipment.getRoutePolyline();

        if (polyline == null && shipment.getOriginLatitude() != null && shipment.getDestinationLatitude() != null) {
            try {
                LatLng origin = LatLng.builder()
                        .latitude(shipment.getOriginLatitude())
                        .longitude(shipment.getOriginLongitude())
                        .build();
                LatLng dest = LatLng.builder()
                        .latitude(shipment.getDestinationLatitude())
                        .longitude(shipment.getDestinationLongitude())
                        .build();
                RouteInfo route = geocodingService.calculateRoute(origin, dest);
                if (route != null) {
                    polyline = route.getPolylinePoints();
                }
            } catch (Exception e) {
                log.warn("Failed to calculate route for live tracking shipment {}", id, e);
            }
        }

        LiveTrackingResponse response = LiveTrackingResponse.builder()
                .shipmentId(shipment.getId())
                .trackingNumber(shipment.getTrackingNumber())
                .status(shipment.getStatus())
                .latitude(latest != null ? latest.getLatitude() : null)
                .longitude(latest != null ? latest.getLongitude() : null)
                .originLatitude(shipment.getOriginLatitude())
                .originLongitude(shipment.getOriginLongitude())
                .destinationLatitude(shipment.getDestinationLatitude())
                .destinationLongitude(shipment.getDestinationLongitude())
                .estimatedDeliveryTime(shipment.getEstimatedDeliveryTime())
                .estimatedDuration(shipment.getEstimatedDuration())
                .totalDistance(shipment.getTotalDistance())
                .routePolyline(polyline)
                .senderName(shipment.getSenderName())
                .receiverName(shipment.getReceiverName())
                .senderAddress(shipment.getSenderAddress())
                .deliveryAddress(shipment.getDeliveryAddress())
                .createdAt(shipment.getCreatedAt())
                .lastUpdatedAt(latest != null ? latest.getRecordedAt() : null)
                .recentEvents(recentEvents)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/location")
    public ResponseEntity<Void> updateLocation(
            @PathVariable Long id,
            @RequestBody TrackingEventRequest request,
            Authentication authentication) {

        shipmentService.addTrackingEvent(id, request, authentication.getName());

        liveTrackingService.broadcastLocationUpdate(
                id, request.getLatitude(), request.getLongitude(), request.getStatus());

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/coordinates")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateCoordinates(
            @PathVariable Long id,
            @RequestBody Map<String, Double> coords) {
        Shipment shipment = shipmentRepository.findById(id).orElse(null);
        if (shipment == null) {
            return ResponseEntity.notFound().build();
        }

        if (coords.containsKey("originLatitude")) shipment.setOriginLatitude(coords.get("originLatitude"));
        if (coords.containsKey("originLongitude")) shipment.setOriginLongitude(coords.get("originLongitude"));
        if (coords.containsKey("destinationLatitude")) shipment.setDestinationLatitude(coords.get("destinationLatitude"));
        if (coords.containsKey("destinationLongitude")) shipment.setDestinationLongitude(coords.get("destinationLongitude"));

        if (shipment.getOriginLatitude() != null && shipment.getDestinationLatitude() != null) {
            try {
                LatLng origin = LatLng.builder()
                        .latitude(shipment.getOriginLatitude())
                        .longitude(shipment.getOriginLongitude())
                        .build();
                LatLng dest = LatLng.builder()
                        .latitude(shipment.getDestinationLatitude())
                        .longitude(shipment.getDestinationLongitude())
                        .build();
                RouteInfo route = geocodingService.calculateRoute(origin, dest);
                if (route != null) {
                    shipment.setTotalDistance(route.getDistanceKm());
                    shipment.setEstimatedDuration(route.getDurationMin());
                    shipment.setRoutePolyline(route.getPolylinePoints());
                }
            } catch (Exception e) {
                log.warn("Failed to recalculate route for shipment {}", id, e);
            }
        }

        shipmentRepository.save(shipment);
        log.info("Admin updated coordinates for shipment {}: origin({}, {}) dest({}, {})",
                id, shipment.getOriginLatitude(), shipment.getOriginLongitude(),
                shipment.getDestinationLatitude(), shipment.getDestinationLongitude());
        return ResponseEntity.ok().build();
    }
}
