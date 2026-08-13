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

    @Builder.Default
    private List<ShipmentBrief> activeShipments = List.of();

    private int shipmentCapacity;

    private int activeShipmentCount;

    private long totalDelivered;

    private LocalDateTime createdAt;

    private String temporaryPassword;

}