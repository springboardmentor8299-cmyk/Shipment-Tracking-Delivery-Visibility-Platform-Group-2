package com.shiptrack.admin.route.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.shiptrack.admin.route.dto.DistanceCalculationResponse;
import com.shiptrack.admin.route.dto.RouteAnalyticsResponse;
import com.shiptrack.admin.route.dto.RouteOptimizeRequest;
import com.shiptrack.admin.route.dto.RoutePlanRequest;
import com.shiptrack.admin.route.dto.RouteStatusUpdateRequest;
import com.shiptrack.admin.route.entity.Route;
import com.shiptrack.admin.route.entity.RouteStatus;
import com.shiptrack.admin.route.service.RouteService;

@RestController
@RequestMapping("/api/admin/routes")
public class AdminRouteController {

    private final RouteService routeService;

    public AdminRouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    // Listing (optionally filtered by status), e.g. /api/admin/routes?status=PLANNED
    @GetMapping
    public List<Route> getAllRoutes(@RequestParam(required = false) RouteStatus status) {
        return routeService.getAllRoutes(status);
    }

    @GetMapping("/{id}")
    public Route getRoute(@PathVariable Long id) {
        return routeService.getRoute(id);
    }

    // (i) Route planning
    @PostMapping("/plan")
    public Route planRoute(@RequestBody RoutePlanRequest request, Authentication authentication) {
        return routeService.planRoute(request, authentication.getName());
    }

    // (ii) Route optimization
    @PostMapping("/{id}/optimize")
    public Route optimizeRoute(@PathVariable Long id, @RequestBody(required = false) RouteOptimizeRequest request) {
        String strategy = request != null ? request.getStrategy() : null;
        return routeService.optimizeRoute(id, strategy);
    }

    // (iii) Route history
    @GetMapping("/history")
    public List<Route> getHistory() {
        return routeService.getHistory();
    }

    // (iv) Distance calculations
    @GetMapping("/distance")
    public DistanceCalculationResponse calculateDistance(
            @RequestParam String origin,
            @RequestParam String destination) {
        return routeService.calculateDistance(origin, destination);
    }

    // (v) Traffic-aware routing — recompute the traffic estimate for a route
    @PostMapping("/{id}/refresh-traffic")
    public Route refreshTraffic(@PathVariable Long id) {
        return routeService.refreshTraffic(id);
    }

    // (vi) Route analytics
    @GetMapping("/analytics")
    public RouteAnalyticsResponse getAnalytics() {
        return routeService.getAnalytics();
    }

    // Lifecycle management (PLANNED -> ACTIVE -> COMPLETED / ARCHIVED / CANCELLED)
    @PutMapping("/{id}/status")
    public Route updateStatus(@PathVariable Long id, @RequestBody RouteStatusUpdateRequest request) {
        return routeService.updateStatus(id, request.getStatus());
    }

    @DeleteMapping("/{id}")
    public void deleteRoute(@PathVariable Long id) {
        routeService.deleteRoute(id);
    }

}
