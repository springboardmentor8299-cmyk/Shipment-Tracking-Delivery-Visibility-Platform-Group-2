package com.shiptrack.service;

import com.shiptrack.dto.ForecastResponse;
import com.shiptrack.dto.LatLng;
import com.shiptrack.dto.RouteInfo;
import com.shiptrack.entity.DeliveryPrediction;
import com.shiptrack.entity.Shipment;
import com.shiptrack.repository.DeliveryPredictionRepository;
import com.shiptrack.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ForecastService {

    private final ShipmentRepository shipmentRepository;
    private final DeliveryPredictionRepository deliveryPredictionRepository;
    private final GeocodingService geocodingService;

    public ForecastResponse generateForecast(Long shipmentId) {
        Shipment shipment = shipmentRepository.findById(shipmentId).orElse(null);
        if (shipment == null) return null;

        if (shipment.getOriginLatitude() == null || shipment.getOriginLongitude() == null ||
            shipment.getDestinationLatitude() == null || shipment.getDestinationLongitude() == null) {
            log.warn("Cannot generate forecast for shipment {}: missing coordinates", shipmentId);
            return ForecastResponse.builder()
                    .predictedDeliveryTime(shipment.getEstimatedDeliveryTime())
                    .confidenceScore(0.3)
                    .routeDistance(shipment.getTotalDistance())
                    .routeDuration(shipment.getEstimatedDuration())
                    .trafficCondition("UNKNOWN")
                    .predictionGeneratedAt(LocalDateTime.now())
                    .build();
        }

        LatLng origin = new LatLng(shipment.getOriginLatitude(), shipment.getOriginLongitude());
        LatLng destination = new LatLng(shipment.getDestinationLatitude(), shipment.getDestinationLongitude());

        RouteInfo route = geocodingService.calculateRoute(origin, destination);
        if (route == null) {
            return ForecastResponse.builder()
                    .predictedDeliveryTime(shipment.getEstimatedDeliveryTime())
                    .confidenceScore(0.3)
                    .routeDistance(shipment.getTotalDistance())
                    .routeDuration(shipment.getEstimatedDuration())
                    .trafficCondition("UNKNOWN")
                    .predictionGeneratedAt(LocalDateTime.now())
                    .build();
        }

        double timeAdjustment = getTimeOfDayAdjustment();
        double dayAdjustment = getDayOfWeekAdjustment();
        double adjustedDuration = route.getDurationMin() * timeAdjustment * dayAdjustment;

        LocalDateTime predictedTime = LocalDateTime.now().plusMinutes((long) Math.ceil(adjustedDuration));

        String trafficCondition = route.getDurationMin() > 0 ? "MODERATE" : "UNKNOWN";
        double confidenceScore = 0.75;

        DeliveryPrediction prediction = DeliveryPrediction.builder()
                .shipment(shipment)
                .predictedDeliveryTime(predictedTime)
                .confidenceScore(confidenceScore)
                .predictionGeneratedAt(LocalDateTime.now())
                .routeDistance(route.getDistanceKm())
                .routeDuration(route.getDurationMin())
                .trafficCondition(trafficCondition)
                .build();

        deliveryPredictionRepository.save(prediction);

        log.info("Forecast generated for shipment {}: delivery at {} ({}% confidence)",
                shipmentId, predictedTime, confidenceScore);

        return ForecastResponse.builder()
                .predictedDeliveryTime(predictedTime)
                .confidenceScore(confidenceScore)
                .routeDistance(route.getDistanceKm())
                .routeDuration(route.getDurationMin())
                .trafficCondition(trafficCondition)
                .predictionGeneratedAt(LocalDateTime.now())
                .build();
    }

    private double getTimeOfDayAdjustment() {
        LocalTime now = LocalTime.now();
        if (now.isAfter(LocalTime.of(7, 0)) && now.isBefore(LocalTime.of(10, 0))) return 1.2;
        if (now.isAfter(LocalTime.of(16, 0)) && now.isBefore(LocalTime.of(19, 0))) return 1.3;
        if (now.isAfter(LocalTime.of(22, 0)) || now.isBefore(LocalTime.of(5, 0))) return 0.9;
        return 1.0;
    }

    private double getDayOfWeekAdjustment() {
        int day = LocalDateTime.now().getDayOfWeek().getValue();
        if (day >= 6) return 1.1;
        return 1.0;
    }
}
