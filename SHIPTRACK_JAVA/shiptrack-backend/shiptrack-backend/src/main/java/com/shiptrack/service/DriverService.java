package com.shiptrack.service;

import com.shiptrack.dto.driver.DriverDashboardOverviewResponse;
import com.shiptrack.dto.driver.DriverRouteHistoryResponse;
import com.shiptrack.dto.driver.DriverShipmentResponse;
import com.shiptrack.dto.driver.DriverStatusUpdateRequest;

import java.util.List;

public interface DriverService {

    DriverDashboardOverviewResponse getOverview();

    List<DriverShipmentResponse> getAssignedShipments(String search);

    List<DriverShipmentResponse> getDeliveredShipments();

    DriverShipmentResponse getShipmentDetails(Long shipmentId);

    DriverShipmentResponse updateShipmentStatus(Long shipmentId, DriverStatusUpdateRequest request);

    List<DriverRouteHistoryResponse> getRouteHistory();
}
