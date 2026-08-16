package com.shiptrack.analytics;

import com.shiptrack.analytics.dto.AnalyticsResponse;
import com.shiptrack.shipment.ShipmentRepository;
import com.shiptrack.shipment.ShipmentStatus;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    private final ShipmentRepository shipmentRepository;

    public AnalyticsService(
            ShipmentRepository shipmentRepository
    ) {
        this.shipmentRepository = shipmentRepository;
    }

    public AnalyticsResponse getShipmentAnalytics() {

        long totalShipments =
                shipmentRepository.count();

        long deliveredShipments =
                shipmentRepository.countByStatus(
                        ShipmentStatus.DELIVERED
                );

        long pendingShipments =
                shipmentRepository.countByStatus(
                        ShipmentStatus.PENDING
                );

        long inTransitShipments =
                shipmentRepository.countByStatus(
                        ShipmentStatus.IN_TRANSIT
                );


        long failedDeliveries =
                shipmentRepository.countByStatus(
                        ShipmentStatus.FAILED_DELIVERY
                );

        double deliverySuccessRate = 0.0;

        if (totalShipments > 0) {
            deliverySuccessRate =
                    ((double) deliveredShipments
                            / totalShipments) * 100;
        }

        AnalyticsResponse response =
                new AnalyticsResponse();

        response.setTotalShipments(totalShipments);
        response.setDeliveredShipments(
                deliveredShipments
        );
        response.setPendingShipments(
                pendingShipments
        );
        response.setInTransitShipments(
                inTransitShipments
        );

        response.setFailedDeliveries(
                failedDeliveries
        );
        response.setDeliverySuccessRate(
                Math.round(
                        deliverySuccessRate * 100.0
                ) / 100.0
        );

        return response;
    }
}