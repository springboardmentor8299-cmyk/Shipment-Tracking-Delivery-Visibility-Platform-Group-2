package com.shiptrack.dto.tracking;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverLocationResponse {
    private Long driverId;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private Double heading;
    private Double accuracy;
    private String lastUpdated;
}
