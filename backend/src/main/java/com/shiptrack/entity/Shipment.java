package com.shiptrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_number", nullable = false, unique = true, length = 20)
    private String trackingNumber;

    @Column(name = "sender_name", length = 100)
    private String senderName;

    @Column(name = "sender_address", columnDefinition = "text")
    private String senderAddress;

    @Column(name = "receiver_name", length = 100)
    private String receiverName;

    @Column(name = "delivery_address", columnDefinition = "text")
    private String deliveryAddress;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String status = "CREATED";

    // --- Location & ETA fields ---
    @Column(name = "origin_latitude")
    private Double originLatitude;

    @Column(name = "origin_longitude")
    private Double originLongitude;

    @Column(name = "destination_latitude")
    private Double destinationLatitude;

    @Column(name = "destination_longitude")
    private Double destinationLongitude;

    @Column(name = "estimated_delivery_time")
    private LocalDateTime estimatedDeliveryTime;

    @Column(name = "actual_delivery_time")
    private LocalDateTime actualDeliveryTime;

    @Column(name = "estimated_duration")
    private Long estimatedDuration;

    @Column(name = "total_distance")
    private Double totalDistance;

    @Column(name = "route_polyline", columnDefinition = "TEXT")
    private String routePolyline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
