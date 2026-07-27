package com.shiptrack.service;

import com.shiptrack.dto.EtaResponse;
import com.shiptrack.shipment.Shipment;
import com.shiptrack.util.DistanceUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class EtaService {

    private static final double AVERAGE_SPEED_KMH = 40.0;

    public EtaResponse calculateEta(Shipment shipment) {

        if (shipment.getCurrentLatitude() == null
                || shipment.getCurrentLongitude() == null
                || shipment.getDestinationLatitude() == null
                || shipment.getDestinationLongitude() == null) {

            throw new IllegalArgumentException(
                    "Current and destination coordinates are required."
            );
        }

        double distance = DistanceUtil.calculateDistance(
                shipment.getCurrentLatitude(),
                shipment.getCurrentLongitude(),
                shipment.getDestinationLatitude(),
                shipment.getDestinationLongitude()
        );

        long travelMinutes = Math.round((distance / AVERAGE_SPEED_KMH) * 60);

        LocalDateTime eta = LocalDateTime.now().plusMinutes(travelMinutes);

        int delayMinutes = 0;
        String delayReason = null;

        if (shipment.getLastLocationUpdate() != null &&
                shipment.getLastLocationUpdate().isBefore(LocalDateTime.now().minusHours(2))) {

            delayMinutes = 30;
            delayReason = "No location update received for more than 2 hours";
            eta = eta.plusMinutes(delayMinutes);
        }

        shipment.setEstimatedDeliveryTime(eta);
        shipment.setPredictedDelayMinutes(delayMinutes);
        shipment.setDelayReason(delayReason);

        EtaResponse response = new EtaResponse();
        response.setRemainingDistanceKm(Math.round(distance * 100.0) / 100.0);
        response.setEstimatedDeliveryTime(eta);
        response.setPredictedDelayMinutes(delayMinutes);
        response.setDelayed(delayMinutes > 0);
        response.setDelayReason(delayReason);

        return response;
    }
}