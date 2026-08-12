package com.shiptrack.dto.tracking;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentLocationResponse {
    private Long shipmentId;
    private String trackingNumber;
    private Double latitude;
    private Double longitude;
    private String shipmentStatus;
}
