package com.shiptrack.admin.route.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RouteAnalyticsResponse {

    private long totalRoutes;

    private long plannedCount;
    private long activeCount;
    private long completedCount;
    private long archivedCount;
    private long cancelledCount;

    private Double averageDistanceKm;
    private Double averageDurationMinutes;
    private Double totalDistanceKm;

    private long optimizedRouteCount;
    private Double averageOptimizationSavingsPercent;

    // Traffic condition name -> number of routes currently in that condition
    private Map<String, Long> trafficBreakdown;

    private RouteSummary longestRoute;
    private RouteSummary shortestRoute;

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RouteSummary {
        private String routeCode;
        private String origin;
        private String destination;
        private Double distanceKm;
    }

}
