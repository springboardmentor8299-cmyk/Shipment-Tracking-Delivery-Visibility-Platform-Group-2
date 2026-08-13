package com.shiptrack.admin.route.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "routes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, updatable = false)
    private String routeCode;

    private String routeName;

    // ORIGIN
    @Column(nullable = false)
    private String origin;

    @Column(name = "origin_latitude")
    private Double originLatitude;

    @Column(name = "origin_longitude")
    private Double originLongitude;

    // DESTINATION
    @Column(nullable = false)
    private String destination;

    @Column(name = "destination_latitude")
    private Double destinationLatitude;

    @Column(name = "destination_longitude")
    private Double destinationLongitude;

    // PLANNED METRICS (route planning + distance calculation)
    private Double distanceKm;

    private Double durationMinutes;

    private Double straightLineDistanceKm;

    // OPTIMIZATION
    private Boolean optimized;

    private String optimizationStrategy;

    private Double optimizedDistanceKm;

    private Double optimizedDurationMinutes;

    private Double optimizationSavingsPercent;

    // TRAFFIC-AWARE ROUTING
    @Enumerated(EnumType.STRING)
    private TrafficCondition trafficCondition;

    private Double trafficAdjustedDurationMinutes;

    private LocalDateTime trafficUpdatedAt;

    // LIFECYCLE
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RouteStatus status;

    private String assignedTrackingId;

    private String createdBy;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    @Column(length = 1000)
    private String notes;

    @Transient
    private Boolean shipmentSynced;

    @Transient
    private String shipmentSyncMessage;

}
