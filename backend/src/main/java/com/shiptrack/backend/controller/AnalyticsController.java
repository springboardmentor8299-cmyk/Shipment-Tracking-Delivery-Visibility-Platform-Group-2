package com.shiptrack.backend.controller;

import com.shiptrack.backend.dto.AnalyticsResponse;
import com.shiptrack.backend.repository.ShipmentRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    private final ShipmentRepository shipmentRepository;

    public AnalyticsController(ShipmentRepository shipmentRepository) {
        this.shipmentRepository = shipmentRepository;
    }

    @GetMapping
    public AnalyticsResponse getAnalytics() {

        long total = shipmentRepository.count();

        long delivered =
                shipmentRepository.findAll()
                        .stream()
                        .filter(s -> "Delivered".equalsIgnoreCase(s.getStatus()))
                        .count();

        long inTransit =
                shipmentRepository.findAll()
                        .stream()
                        .filter(s -> "In Transit".equalsIgnoreCase(s.getStatus()))
                        .count();

        long pending =
                shipmentRepository.findAll()
                        .stream()
                        .filter(s -> "Pending".equalsIgnoreCase(s.getStatus()))
                        .count();

        double successRate = total == 0
                ? 0
                : ((double) delivered / total) * 100;

        return new AnalyticsResponse(
                total,
                delivered,
                inTransit,
                pending,
                successRate
        );
    }
}