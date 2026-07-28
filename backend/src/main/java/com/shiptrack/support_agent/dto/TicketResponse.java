package com.shiptrack.support_agent.dto;

import java.time.LocalDateTime;

import com.shiptrack.support_agent.entity.TicketStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {

    private Long id;

    // Customer
    private Long customerId;
    private String customerName;

    // Shipment
    private Long shipmentId;
    private String trackingId;

    // Ticket Details
    private String subject;
    private String description;
    private TicketStatus status;

    // Support Agent
    private Long assignedToId;
    private String assignedToName;

    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}