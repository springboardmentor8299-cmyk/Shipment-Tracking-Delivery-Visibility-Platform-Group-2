package com.shiptrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentStatsResponse {

    private long total;
    private long created;
    private long inTransit;
    private long outForDelivery;
    private long delivered;
    private long cancelled;
}
