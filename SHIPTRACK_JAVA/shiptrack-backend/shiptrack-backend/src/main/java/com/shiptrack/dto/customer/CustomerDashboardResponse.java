package com.shiptrack.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDashboardResponse {

    
    private Long customerId;
    private String customerName;

    
    private Long totalShipments;
    private Long createdShipments;
    private Long deliveredShipments;
    private Long inTransitShipments;
    private Long pendingShipments;
    private Long outForDeliveryShipments;
    private Long pickedUpShipments;
    private Long cancelledShipments;
    private Long deliveryFailedShipments;
    private Long activeShipments;

    
    private Long deliverySuccessRate;
    private Long averageDeliveryTimeMinutes;
    private LocalDateTime lastDeliveryDate;

    
    private List<CustomerShipmentResponse> recentShipments;
    private List<CustomerNotificationResponse> recentNotifications;
}
