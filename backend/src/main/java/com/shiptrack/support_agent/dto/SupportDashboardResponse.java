package com.shiptrack.support_agent.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class SupportDashboardResponse {

    private long totalShipments;
    private long activeDeliveries;
    private long openTickets;
    private long resolvedToday;
}