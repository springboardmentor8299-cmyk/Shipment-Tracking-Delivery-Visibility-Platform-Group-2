package com.shiptrack.controller;

import com.shiptrack.dto.tracking.RouteHistoryResponse;
import com.shiptrack.dto.tracking.RouteLocationRequest;
import com.shiptrack.dto.tracking.RouteSummaryResponse;
import com.shiptrack.service.RouteHistoryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RouteHistoryController {

    private final RouteHistoryService routeHistoryService;

    public RouteHistoryController(
            RouteHistoryService routeHistoryService) {

        this.routeHistoryService = routeHistoryService;
    }

    @PostMapping("/location")
    @PreAuthorize("hasRole('DRIVER')")
    public RouteHistoryResponse recordLocation(
            @RequestBody RouteLocationRequest request) {

        return routeHistoryService.recordLocation(request);
    }

    @GetMapping("/{shipmentId}")
    @PreAuthorize(
            "hasAnyRole('ADMIN','OPERATOR','SUPPORT','DRIVER','CUSTOMER')"
    )
    public List<RouteHistoryResponse> getRouteByShipment(
            @PathVariable Long shipmentId) {

        return routeHistoryService.getRouteByShipment(shipmentId);
    }

    @GetMapping("/driver/{driverId}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<RouteHistoryResponse> getRouteByDriver(
            @PathVariable Long driverId) {

        return routeHistoryService.getRouteByDriver(driverId);
    }

    @GetMapping("/{shipmentId}/summary")
    @PreAuthorize(
            "hasAnyRole('ADMIN','OPERATOR','SUPPORT','DRIVER','CUSTOMER')"
    )
    public RouteSummaryResponse getRouteSummary(
            @PathVariable Long shipmentId) {

        return routeHistoryService.getRouteSummary(shipmentId);
    }
}
