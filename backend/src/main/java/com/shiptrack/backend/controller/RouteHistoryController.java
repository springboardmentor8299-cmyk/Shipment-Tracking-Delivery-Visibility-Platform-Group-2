package com.shiptrack.backend.controller;

import com.shiptrack.backend.entity.RouteHistory;
import com.shiptrack.backend.service.RouteHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "http://localhost:5173")
public class RouteHistoryController {

    private final RouteHistoryService routeHistoryService;

    public RouteHistoryController(RouteHistoryService routeHistoryService) {
        this.routeHistoryService = routeHistoryService;
    }

    /**
     * GET /api/routes/{shipmentId}/history
     * Retrieve full route polyline + waypoint timestamps for map replay
     */
    @GetMapping("/{shipmentId}/history")
    public ResponseEntity<List<RouteHistory>> getRouteHistory(@PathVariable Long shipmentId) {
        List<RouteHistory> history = routeHistoryService.getRouteHistory(shipmentId);
        return ResponseEntity.ok(history);
    }
}
