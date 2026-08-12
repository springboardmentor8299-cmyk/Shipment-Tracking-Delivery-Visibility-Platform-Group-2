package com.shiptrack.dto.driver;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverDashboardOverviewResponse {

    private long assignedShipments;

    private long pendingDeliveries;

    private long inTransitCount;

    private long outForDeliveryCount;

    private long completedToday;

    private long todayDeliveryCount;

    private long completedDeliveries;

    private long failedDeliveries;

    private long cancelledDeliveries;

    private String currentStatus;
}
