package com.shiptrack.business_client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessDashboardResponse {

    private long totalShipments;

    private long activeDeliveries;

    private long shipmentsInTransit;

    private long deliveredToday;

}