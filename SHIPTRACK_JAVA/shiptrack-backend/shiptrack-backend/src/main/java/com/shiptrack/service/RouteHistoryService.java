package com.shiptrack.service;

import com.shiptrack.dto.tracking.RouteHistoryResponse;
import com.shiptrack.dto.tracking.RouteLocationRequest;
import com.shiptrack.dto.tracking.RouteSummaryResponse;

import java.util.List;

public interface RouteHistoryService {

    RouteHistoryResponse recordLocation(RouteLocationRequest request);

    List<RouteHistoryResponse> getRouteByShipment(Long shipmentId);

    List<RouteHistoryResponse> getRouteByDriver(Long driverId);

    RouteSummaryResponse getRouteSummary(Long shipmentId);
}
