package com.shiptrack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_predictions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id")
    private Shipment shipment;

    @Column(name = "predicted_delivery_time")
    private LocalDateTime predictedDeliveryTime;

    @Column(name = "confidence_score")
    private Double confidenceScore;

    @Column(name = "prediction_generated_at")
    private LocalDateTime predictionGeneratedAt;

    @Column(name = "route_distance")
    private Double routeDistance;

    @Column(name = "route_duration")
    private Long routeDuration;

    @Column(name = "traffic_condition", length = 30)
    private String trafficCondition;
}
