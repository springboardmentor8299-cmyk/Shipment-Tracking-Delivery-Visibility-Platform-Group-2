package com.shiptrack.controller;

import com.shiptrack.dto.AnalyticsOverviewResponse;
import com.shiptrack.dto.DeliveryPerformanceReport;
import com.shiptrack.dto.TrendsResponse;
import com.shiptrack.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<AnalyticsOverviewResponse> getOverview(Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getOverview(authentication.getName()));
    }

    @GetMapping("/trends")
    public ResponseEntity<TrendsResponse> getTrends(
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getTrends(days, authentication.getName()));
    }

    @GetMapping("/status-distribution")
    public ResponseEntity<Map<String, Long>> getStatusDistribution(
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication) {
        return ResponseEntity.ok(analyticsService.getStatusDistribution(days, authentication.getName()));
    }

    @GetMapping("/report/delivery-performance")
    public ResponseEntity<?> getDeliveryPerformanceReport(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "json") String format,
            Authentication authentication) {
        DeliveryPerformanceReport report = analyticsService.getDeliveryPerformanceReport(days, authentication.getName());

        if ("csv".equalsIgnoreCase(format)) {
            byte[] csv = analyticsService.toCsv(report).getBytes(StandardCharsets.UTF_8);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=delivery-performance-report.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csv);
        }

        return ResponseEntity.ok(report);
    }
}
