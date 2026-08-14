package com.shiptrack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "route_history_points")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteHistoryPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id", nullable = false)
    private Shipment shipment;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;

    @Column(name = "speed")
    private Double speed;

    @Column(name = "progress")
    private Double progress;
}
