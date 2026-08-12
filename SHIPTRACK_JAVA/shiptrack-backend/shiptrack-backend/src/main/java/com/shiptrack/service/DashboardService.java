package com.shiptrack.service;

import com.shiptrack.dto.ActivityResponse;
import com.shiptrack.dto.SystemHealthResponse;
import com.shiptrack.dto.tracking.LiveDeliveryMonitorResponse;
import com.shiptrack.dto.tracking.ShipmentMonitoringResponse;
import com.shiptrack.entity.User;
import java.util.List;


public interface DashboardService {

    List<ActivityResponse> getRecentActivities();
    List<SystemHealthResponse> getSystemHealth();
    List<LiveDeliveryMonitorResponse> getLiveMonitoring();
    List<ShipmentMonitoringResponse> getShipmentMonitoring();
    List<ShipmentMonitoringResponse> getShipmentMonitoringForUser(User user);
}
