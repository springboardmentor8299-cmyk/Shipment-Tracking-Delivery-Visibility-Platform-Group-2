package com.shiptrack.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "route_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long shipmentId;

    private double latitude;

    private double longitude;

    private LocalDateTime updatedAt;

}