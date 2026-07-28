package com.shiptrack.logistics_operator.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OperatorDashboardResponse {

    private long totalShipments;

    private long activeDeliveries;

    private long routesAssigned;

    private long deliveredToday;

}