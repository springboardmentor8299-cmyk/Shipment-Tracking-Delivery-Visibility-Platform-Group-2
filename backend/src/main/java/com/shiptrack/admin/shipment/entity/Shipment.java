package com.shiptrack.admin.shipment.entity;

import com.shiptrack.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
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

    @Column(nullable = false, unique = true, updatable = false)
    private String trackingId;

    @Column(nullable = false)
    private String customerName;

    @Column
    private String receiverName;

    @Column
    private String noOfItems;

    @Column
    private String totalWeightOfItems;

    @Column
    private String shipmentCost;

    @Column(nullable = false)
    private String origin;

    @Column(nullable = false)
    private String destination;

    @Enumerated(EnumType.STRING)
    private ShipmentStatus status;

    private LocalDate shipmentDate;

    private LocalDate deliveryDate;

    @Column(name = "origin_latitude")
    private Double originLatitude;

    @Column(name = "origin_longitude")
    private Double originLongitude;

    @Column(name = "destination_latitude")
    private Double destinationLatitude;

    @Column(name = "destination_longitude")
    private Double destinationLongitude;

    @Column(name = "current_latitude")
    private Double currentLatitude;

    @Column(name = "current_longitude")
    private Double currentLongitude;

    @Column(name = "current_location_name")
    private String currentLocationName;

    @Column(name = "truck_speed")
    private Double truckSpeed;

    @Column(name = "remaining_distance")
    private Double remainingDistance;

    @Column(name = "estimated_delivery_time")
    private LocalDateTime estimatedDeliveryTime;

    @Column(name = "last_location_update")
    private LocalDateTime lastLocationUpdate;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private User customerId;

}