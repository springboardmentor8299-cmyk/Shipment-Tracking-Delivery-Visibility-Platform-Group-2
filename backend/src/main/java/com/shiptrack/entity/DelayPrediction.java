package com.shiptrack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "delay_predictions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DelayPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipment_id")
    private Shipment shipment;

    @Column(name = "delay_minutes")
    private Integer delayMinutes;

    @Column(name = "delay_reason", length = 255)
    private String delayReason;

    @Column(name = "probability")
    private Double probability;

    @Column(name = "detected_at")
    private LocalDateTime detectedAt;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
