package com.shiptrack.dto.tracking;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapLocationResponse {
    private Long driverId;
    private String driverName;
    private Double latitude;
    private Double longitude;
}
