package com.shiptrack.driver.dto;

import com.shiptrack.driver.entity.VehicleType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DriverRequest {

    private String name;

    private String phone;

    // Doubles as the driver's login username, so it's required.
    private String email;

    private String licenseNumber;

    private VehicleType vehicleType;

    private String vehicleNumber;

}
