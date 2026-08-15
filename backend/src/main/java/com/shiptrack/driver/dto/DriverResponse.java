package com.shiptrack.driver.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.shiptrack.driver.entity.DriverStatus;
import com.shiptrack.driver.entity.VehicleType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverResponse {

    private Long id;

    private String name;

    private String phone;

    private String email;

    private String licenseNumber;

    private VehicleType vehicleType;

    private String vehicleNumber;

    private DriverStatus status;

    // All shipments currently assigned to this driver that haven't reached
    // a terminal status yet. Empty (not null) when the driver is free.
    @Builder.Default
    private List<ShipmentBrief> activeShipments = List.of();

    // How many shipments this driver can carry at once, based on vehicleType
    // (BIKE 10, VAN 20, MINI_TRUCK 30, TRUCK 50).
    private int shipmentCapacity;

    // activeShipments.size() - how many slots are currently filled.
    private int activeShipmentCount;

    private long totalDelivered;

    private LocalDateTime createdAt;

    // Only populated in the response right after a driver is created, so the
    // operator can hand the login credentials to the driver. Never returned
    // on subsequent reads/updates.
    private String temporaryPassword;

}