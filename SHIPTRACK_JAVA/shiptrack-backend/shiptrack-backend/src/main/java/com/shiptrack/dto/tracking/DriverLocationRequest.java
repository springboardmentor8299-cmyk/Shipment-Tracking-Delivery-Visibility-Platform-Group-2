package com.shiptrack.dto.tracking;

import lombok.Data;

@Data
public class DriverLocationRequest {
    private Double latitude;
    private Double longitude;
    private Double speed;
    private Double heading;
    private Double accuracy;
}
