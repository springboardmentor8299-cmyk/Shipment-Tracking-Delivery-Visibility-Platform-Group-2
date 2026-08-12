package com.shiptrack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name="driver_locations", uniqueConstraints=@UniqueConstraint(columnNames="driver_id"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private Double speed;
    private Double heading;
    private Double accuracy;

    @Column(nullable = false)
    private LocalDateTime lastUpdated;

    @PrePersist
    public void onCreate() {
        lastUpdated = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }
}
