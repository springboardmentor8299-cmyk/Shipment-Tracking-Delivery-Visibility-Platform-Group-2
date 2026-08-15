package com.shiptrack.driver.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.shiptrack.auth.entity.User;

import jakarta.persistence.*;
import lombok.*;

/**
 * Operational profile for a driver. Login/identity (name, phone, password)
 * lives on the linked {@link User} (role = DRIVER) so a driver can
 * authenticate through the normal /api/auth/login flow; this entity only
 * holds driver-specific fields plus their live status.
 */
@Entity
@Table(name = "drivers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "license_number", nullable = false)
    private String licenseNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false, length = 20)
    private VehicleType vehicleType;

    @Column(name = "vehicle_number", nullable = false)
    private String vehicleNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private DriverStatus status = DriverStatus.AVAILABLE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
