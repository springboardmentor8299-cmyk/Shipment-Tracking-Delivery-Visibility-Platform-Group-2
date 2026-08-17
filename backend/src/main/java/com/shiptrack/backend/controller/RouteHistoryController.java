package com.shiptrack.backend.controller;

import com.shiptrack.backend.entity.RouteHistory;
import com.shiptrack.backend.service.RouteHistoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/route-history")
@CrossOrigin(origins = "http://localhost:3000")
public class RouteHistoryController {

    private final RouteHistoryService routeHistoryService;

    public RouteHistoryController(RouteHistoryService routeHistoryService) {
        this.routeHistoryService = routeHistoryService;
    }

    @GetMapping("/{shipmentId}")
    public List<RouteHistory> getHistory(@PathVariable Long shipmentId) {
        return routeHistoryService.getHistory(shipmentId);
    }
}