package com.shiptrack.analytics;

import com.shiptrack.analytics.dto.AnalyticsResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(
            AnalyticsService analyticsService
    ) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/shipments")
    @PreAuthorize(
            "hasAnyRole('ADMINISTRATOR','LOGISTICS_OPERATOR')"
    )
    public ResponseEntity<AnalyticsResponse>
    getShipmentAnalytics() {

        return ResponseEntity.ok(
                analyticsService.getShipmentAnalytics()
        );
    }
}