package com.shiptrack.service;

import com.shiptrack.dto.ActivityResponse;
import com.shiptrack.dto.SystemHealthResponse;
import com.shiptrack.dto.tracking.LiveDeliveryMonitorResponse;
import com.shiptrack.dto.tracking.ShipmentMonitoringResponse;
import com.shiptrack.entity.Shipment;
import com.shiptrack.entity.User;
import com.shiptrack.repository.ShipmentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final ShipmentRepository shipmentRepository;
    private final DeliveryMonitoringService deliveryMonitoringService;

    public DashboardServiceImpl(ShipmentRepository shipmentRepository,
                                DeliveryMonitoringService deliveryMonitoringService) {
        this.shipmentRepository = shipmentRepository;
        this.deliveryMonitoringService = deliveryMonitoringService;
    }

    @Override
    public List<ActivityResponse> getRecentActivities() {

        List<ActivityResponse> activities = new ArrayList<>();

        activities.add(
                new ActivityResponse(
                        "Shipment Delivered",
                        "Shipment SHP-1023 has been delivered successfully.",
                        "bi-check-circle-fill",
                        "success",
                        "2 minutes ago"
                )
        );

        activities.add(
                new ActivityResponse(
                        "New Business Registered",
                        "ABC Logistics joined the platform.",
                        "bi-building",
                        "primary",
                        "18 minutes ago"
                )
        );

        activities.add(
                new ActivityResponse(
                        "Shipment In Transit",
                        "Shipment SHP-1031 is currently in transit.",
                        "bi-truck",
                        "warning",
                        "45 minutes ago"
                )
        );

        activities.add(
                new ActivityResponse(
                        "Shipment Updated",
                        "Operator Rahul updated shipment status.",
                        "bi-arrow-repeat",
                        "info",
                        "1 hour ago"
                )
        );

        activities.add(
                new ActivityResponse(
                        "Support Ticket Resolved",
                        "Customer support ticket has been resolved.",
                        "bi-headset",
                        "secondary",
                        "2 hours ago"
                )
        );

        return activities;
    }

    @Override
    public List<SystemHealthResponse> getSystemHealth() {

        List<SystemHealthResponse> health = new ArrayList<>();

        health.add(new SystemHealthResponse(
                "Database",
                "UP"
        ));

        health.add(new SystemHealthResponse(
                "Backend",
                "UP"
        ));

        health.add(new SystemHealthResponse(
                "Authentication",
                "UP"
        ));

        health.add(new SystemHealthResponse(
                "API",
                "UP"
        ));

        return health;
    }

    @Override
    public List<LiveDeliveryMonitorResponse> getLiveMonitoring() {
        return shipmentRepository.findTop3ByOrderByCreatedAtDesc()
                .stream()
                .map(Shipment::getId)
                .map(deliveryMonitoringService::getLiveDeliveryMonitoring)
                .toList();
    }

    @Override
    public List<ShipmentMonitoringResponse> getShipmentMonitoring() {
        return deliveryMonitoringService.getAllShipmentMonitoring();
    }

    @Override
    public List<ShipmentMonitoringResponse> getShipmentMonitoringForUser(User user) {
        return shipmentRepository.findByCreatedBy(user)
                .stream()
                .map(deliveryMonitoringService::getShipmentMonitoring)
                .toList();
    }
}
