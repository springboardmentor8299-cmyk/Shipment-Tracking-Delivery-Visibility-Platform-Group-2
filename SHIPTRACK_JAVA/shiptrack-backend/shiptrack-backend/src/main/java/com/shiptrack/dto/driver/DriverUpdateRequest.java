package com.shiptrack.dto.driver;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverUpdateRequest {

    private String fullName;

    private String phone;

    private String vehicleType;

    private String vehicleNumber;

    private Boolean isActive;
}
