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

    private Long customerId;

    private Long shipmentId;

    private String subject;

    private String description;

    private Long assignedTo;

    private String status;

}