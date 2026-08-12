package com.shiptrack.dto.driver;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverAdminResponse {

    private Long driverId;

    private String fullName;

    private String email;

    private String phone;

    private Boolean isActive;

    private String roleName;

    private String vehicleType;

    private String vehicleNumber;

    private String status;

    private Long activeShipments;

    private Long completedDeliveries;

    private Double latitude;

    private Double longitude;

    private LocalDateTime lastLocationUpdate;

    private LocalDateTime createdAt;
}
