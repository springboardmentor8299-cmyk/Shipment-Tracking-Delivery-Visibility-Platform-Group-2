package com.shiptrack.dto.driver;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverCreateRequest {

    private String fullName;

    private String email;

    private String phone;

    private String password;

    private String vehicleType;

    private String vehicleNumber;
}
