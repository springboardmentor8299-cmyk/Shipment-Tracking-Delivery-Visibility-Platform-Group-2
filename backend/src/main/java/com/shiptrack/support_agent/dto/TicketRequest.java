package com.shiptrack.support_agent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketRequest {

    // Customer ID
    private Long customerId;

    // Shipment ID
    private Long shipmentId;

    // Subject
    private String subject;

    // Description
    private String description;

    // Support Agent ID (optional)
    private Long assignedTo;

    // OPEN / IN_PROGRESS / RESOLVED / CLOSED
    private String status;

}