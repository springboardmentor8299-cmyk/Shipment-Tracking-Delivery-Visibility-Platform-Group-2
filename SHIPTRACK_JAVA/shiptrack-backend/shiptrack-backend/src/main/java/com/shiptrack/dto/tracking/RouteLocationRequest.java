package com.shiptrack.dto.tracking;

import lombok.Data;

@Data
public class RouteLocationRequest {

    private Long shipmentId;

    private Double latitude;

    private Double longitude;

    private Double speed;
}
