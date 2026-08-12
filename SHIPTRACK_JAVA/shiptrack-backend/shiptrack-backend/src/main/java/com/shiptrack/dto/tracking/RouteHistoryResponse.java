package com.shiptrack.dto.tracking;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteHistoryResponse {

    private Long id;

    private Long shipmentId;

    private String trackingNumber;

    private Long driverId;

    private String driverName;

    private Double latitude;

    private Double longitude;

    private Double speed;

    private LocalDateTime timestamp;
}
